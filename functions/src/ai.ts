import { onCall } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { defineFlow, runFlow } from "genkit";
import { gemini20Flash } from "@genkit-ai/vertexai";

type Med = {
  id: string;
  name: string;
  genericName?: string;
  dose?: string;
  frequency?: string;
  schedule?: string[];
};

const getUserRole = async (uid: string) => {
  const snap = await admin.firestore().doc(`users/${uid}`).get();
  const data = snap.data() || {};
  return (data as any).role || "patient";
};

const getLanguagePref = async (uid: string) => {
  const snap = await admin.firestore().doc(`users/${uid}/private/preferences`).get();
  const data = snap.data() || {};
  return (data as any).language || "es";
};

const listPatientMedications = async (patientId: string) => {
  const medsSnap = await admin
    .firestore()
    .collection("medications")
    .where("patientId", "==", patientId)
    .get();
  return medsSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Med[];
};

const medicationAnalysisFlow = defineFlow({
  name: "medicationAnalysisFlow",
  inputSchema: {
    type: "object",
    properties: {
      language: { type: "string" },
      medications: { type: "array" },
    },
  },
  outputSchema: { type: "object" },
}, async (input) => {
  const prompt = `You are a clinical assistant. Using the following medication list, produce JSON with keys: conflicts, optimalTiming, dosageAdjustments, interactions, citations. 
Return concise evidence-based recommendations and cite credible sources (FDA labels, clinical guidelines). 
Avoid any personally identifying information. 
Medications: ${JSON.stringify(input.medications)}`;
  const res = await runFlow(gemini20Flash.text({ prompt }));
  try {
    const parsed = JSON.parse(res.outputText());
    return parsed;
  } catch {
    return { raw: res.outputText() } as any;
  }
});

const patientQAFlow = defineFlow({
  name: "patientQAFlow",
  inputSchema: {
    type: "object",
    properties: {
      language: { type: "string" },
      question: { type: "string" },
      medications: { type: "array" },
    },
  },
  outputSchema: { type: "object" },
}, async (input) => {
  const lang = input.language === "en" ? "English" : "Spanish";
  const prompt = `You answer medication questions for patients in ${lang} at a 6th-grade reading level. 
Use the provided medication list to ensure accuracy and include a short safety disclaimer. 
Return JSON with keys: answer, citations.`;
  const res = await runFlow(gemini20Flash.text({ prompt: `${prompt}\nMedications: ${JSON.stringify(input.medications)}\nQuestion: ${input.question}` }));
  try {
    const parsed = JSON.parse(res.outputText());
    return parsed;
  } catch {
    return { raw: res.outputText() } as any;
  }
});

export const medicationAnalysis = onCall(async (request) => {
  const uid = request.auth?.uid || "";
  if (!uid) throw new Error("unauthenticated");
  const role = await getUserRole(uid);
  if (role !== "caregiver") throw new Error("permission-denied");

  const patientId = String(request.data?.patientId || "");
  if (!patientId) throw new Error("invalid-argument");

  const language = await getLanguagePref(uid);
  const meds = await listPatientMedications(patientId);

  const safeMeds = meds.map((m) => ({ id: m.id, name: m.genericName || m.name, dose: m.dose, frequency: m.frequency, schedule: m.schedule }));
  const result = await medicationAnalysisFlow.run({ language, medications: safeMeds });

  await admin.firestore().collection("auditLogs").add({
    action: "AI_MEDICATION_ANALYSIS",
    userId: uid,
    caregiverId: uid,
    patientId,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  } as any);

  return result;
});

export const patientMedicationQA = onCall(async (request) => {
  const uid = request.auth?.uid || "";
  if (!uid) throw new Error("unauthenticated");

  const patientId = String(request.data?.patientId || "");
  const question = String(request.data?.question || "");
  if (!patientId || !question) throw new Error("invalid-argument");

  const language = await getLanguagePref(uid);
  const meds = await listPatientMedications(patientId);
  const safeMeds = meds.map((m) => ({ id: m.id, name: m.genericName || m.name, dose: m.dose, frequency: m.frequency, schedule: m.schedule }));

  const result = await patientQAFlow.run({ language, medications: safeMeds, question });

  await admin.firestore().collection("auditLogs").add({
    action: "AI_PATIENT_QA",
    userId: uid,
    caregiverId: request.data?.caregiverId || "",
    patientId,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  } as any);

  return result;
});

