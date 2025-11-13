import { getFunctions, httpsCallable } from "firebase/functions";

export type MedicationAnalysisResult = {
  conflicts?: any;
  optimalTiming?: any;
  dosageAdjustments?: any;
  interactions?: any;
  citations?: any;
  raw?: string;
};

export const callMedicationAnalysis = async (patientId: string) => {
  const functions = getFunctions();
  const fn = httpsCallable(functions, "medicationAnalysis");
  const res = await fn({ patientId });
  return res.data as MedicationAnalysisResult;
};

export type PatientQAResult = { answer?: string; citations?: any; raw?: string };

export const callPatientMedicationQA = async (patientId: string, question: string, caregiverId?: string) => {
  const functions = getFunctions();
  const fn = httpsCallable(functions, "patientMedicationQA");
  const res = await fn({ patientId, question, caregiverId });
  return res.data as PatientQAResult;
};

