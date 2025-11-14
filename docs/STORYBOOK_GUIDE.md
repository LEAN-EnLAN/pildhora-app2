# Storybook Guide

## Overview

This guide provides instructions for setting up and using Storybook with the Pildhora design system components. Storybook allows you to develop and test UI components in isolation.

## Setup

### Installation

```bash
# Install Storybook for React Native
npx sb init --type react_native

# Install additional dependencies
npm install --save-dev @storybook/addon-ondevice-controls
npm install --save-dev @storybook/addon-ondevice-actions
npm install --save-dev @storybook/addon-ondevice-backgrounds
```

### Configuration

Create `.storybook/main.js`:

```javascript
module.exports = {
  stories: [
    '../src/components/**/*.stories.?(ts|tsx|js|jsx)',
  ],
  addons: [
    '@storybook/addon-ondevice-controls',
    '@storybook/addon-ondevice-actions',
    '@storybook/addon-ondevice-backgrounds',
  ],
};
```

### Running Storybook

Add scripts to `package.json`:

```json
{
  "scripts": {
    "storybook": "start-storybook -p 7007",
    "build-storybook": "build-storybook"
  }
}
```

Run Storybook:

```bash
npm run storybook
```

## Component Stories

### Button Stories

Create `src/components/ui/Button.stories.tsx`:

```typescript
import React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';
import { spacing } from '@/theme/tokens';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'danger', 'ghost', 'outline'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    disabled: {
      control: 'boolean',
    },
    loading: {
      control: 'boolean',
    },
    fullWidth: {
      control: 'boolean',
    },
  },
  decorators: [
    (Story) => (
      <View style={{ padding: spacing.lg }}>
        <Story />
      </View>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
    onPress: () => console.log('Pressed'),
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary Button',
    variant: 'secondary',
    onPress: () => console.log('Pressed'),
  },
};

export const Danger: Story = {
  args: {
    children: 'Delete',
    variant: 'danger',
    onPress: () => console.log('Pressed'),
  },
};

export const Ghost: Story = {
  args: {
    children: 'Ghost Button',
    variant: 'ghost',
    onPress: () => console.log('Pressed'),
  },
};

export const Outline: Story = {
  args: {
    children: 'Outline Button',
    variant: 'outline',
    onPress: () => console.log('Pressed'),
  },
};

export const Loading: Story = {
  args: {
    children: 'Loading...',
    loading: true,
    onPress: () => console.log('Pressed'),
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled',
    disabled: true,
    onPress: () => console.log('Pressed'),
  },
};

export const FullWidth: Story = {
  args: {
    children: 'Full Width',
    fullWidth: true,
    onPress: () => console.log('Pressed'),
  },
};

export const Small: Story = {
  args: {
    children: 'Small',
    size: 'sm',
    onPress: () => console.log('Pressed'),
  },
};

export const Large: Story = {
  args: {
    children: 'Large',
    size: 'lg',
    onPress: () => console.log('Pressed'),
  },
};
```

### Card Stories

Create `src/components/ui/Card.stories.tsx`:

```typescript
import React from 'react';
import { View, Text } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';
import { Button } from './Button';
import { spacing, typography } from '@/theme/tokens';

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'elevated', 'outlined'],
    },
    padding: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
    },
  },
  decorators: [
    (Story) => (
      <View style={{ padding: spacing.lg }}>
        <Story />
      </View>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    children: <Text>Default card content</Text>,
  },
};

export const Elevated: Story = {
  args: {
    variant: 'elevated',
    children: <Text>Elevated card with prominent shadow</Text>,
  },
};

export const Outlined: Story = {
  args: {
    variant: 'outlined',
    children: <Text>Outlined card with border</Text>,
  },
};

export const WithHeader: Story = {
  args: {
    header: (
      <Text style={{ fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold }}>
        Card Title
      </Text>
    ),
    children: <Text>Card content with header</Text>,
  },
};

export const WithFooter: Story = {
  args: {
    children: <Text>Card content with footer</Text>,
    footer: <Button onPress={() => {}}>Action</Button>,
  },
};

export const WithHeaderAndFooter: Story = {
  args: {
    header: <Text style={{ fontWeight: typography.fontWeight.bold }}>Settings</Text>,
    children: <Text>Configuration options</Text>,
    footer: (
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <Button variant="outline" onPress={() => {}}>Cancel</Button>
        <Button onPress={() => {}}>Save</Button>
      </View>
    ),
  },
};

export const NoPadding: Story = {
  args: {
    padding: 'none',
    children: (
      <View>
        <View style={{ height: 100, backgroundColor: '#E5E7EB' }} />
        <View style={{ padding: spacing.md }}>
          <Text>Content with custom padding</Text>
        </View>
      </View>
    ),
  },
};

export const Pressable: Story = {
  args: {
    children: <Text>Tap me!</Text>,
    onPress: () => console.log('Card pressed'),
  },
};
```

### Input Stories

Create `src/components/ui/Input.stories.tsx`:

```typescript
import React, { useState } from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';
import { spacing } from '@/theme/tokens';

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'filled', 'outlined'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    required: {
      control: 'boolean',
    },
  },
  decorators: [
    (Story) => (
      <View style={{ padding: spacing.lg }}>
        <Story />
      </View>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState('');
    return (
      <Input
        label="Email"
        placeholder="Enter your email"
        value={value}
        onChangeText={setValue}
      />
    );
  },
};

export const WithError: Story = {
  render: () => {
    const [value, setValue] = useState('');
    return (
      <Input
        label="Device ID"
        value={value}
        onChangeText={setValue}
        error="Device ID must be at least 5 characters"
      />
    );
  },
};

export const WithHelperText: Story = {
  render: () => {
    const [value, setValue] = useState('');
    return (
      <Input
        label="Password"
        secureTextEntry
        value={value}
        onChangeText={setValue}
        helperText="Must be at least 8 characters"
      />
    );
  },
};

export const Required: Story = {
  render: () => {
    const [value, setValue] = useState('');
    return (
      <Input
        label="Full Name"
        required
        value={value}
        onChangeText={setValue}
      />
    );
  },
};

export const Filled: Story = {
  render: () => {
    const [value, setValue] = useState('');
    return (
      <Input
        variant="filled"
        label="Notes"
        value={value}
        onChangeText={setValue}
        multiline
        numberOfLines={4}
      />
    );
  },
};

export const Outlined: Story = {
  render: () => {
    const [value, setValue] = useState('');
    return (
      <Input
        variant="outlined"
        label="Phone Number"
        value={value}
        onChangeText={setValue}
        keyboardType="phone-pad"
      />
    );
  },
};

export const Disabled: Story = {
  args: {
    label: "User ID",
    value: "12345",
    editable: false,
  },
};
```

### Modal Stories

Create `src/components/ui/Modal.stories.tsx`:

```typescript
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';
import { Modal } from './Modal';
import { Button } from './Button';
import { spacing } from '@/theme/tokens';

const meta: Meta<typeof Modal> = {
  title: 'UI/Modal',
  component: Modal,
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'full'],
    },
    animationType: {
      control: 'select',
      options: ['fade', 'slide'],
    },
    showCloseButton: {
      control: 'boolean',
    },
    closeOnOverlayPress: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Modal>;

export const Default: Story = {
  render: () => {
    const [visible, setVisible] = useState(false);
    return (
      <View>
        <Button onPress={() => setVisible(true)}>Open Modal</Button>
        <Modal visible={visible} onClose={() => setVisible(false)}>
          <Text>Modal content</Text>
          <Button onPress={() => setVisible(false)}>Close</Button>
        </Modal>
      </View>
    );
  },
};

export const WithTitle: Story = {
  render: () => {
    const [visible, setVisible] = useState(false);
    return (
      <View>
        <Button onPress={() => setVisible(true)}>Open Modal</Button>
        <Modal
          visible={visible}
          onClose={() => setVisible(false)}
          title="Confirm Action"
        >
          <Text>Are you sure you want to proceed?</Text>
          <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
            <Button variant="outline" onPress={() => setVisible(false)}>
              Cancel
            </Button>
            <Button onPress={() => setVisible(false)}>
              Confirm
            </Button>
          </View>
        </Modal>
      </View>
    );
  },
};

export const Small: Story = {
  render: () => {
    const [visible, setVisible] = useState(false);
    return (
      <View>
        <Button onPress={() => setVisible(true)}>Open Small Modal</Button>
        <Modal
          visible={visible}
          onClose={() => setVisible(false)}
          size="sm"
          title="Quick Action"
        >
          <Text>Small modal for quick actions</Text>
        </Modal>
      </View>
    );
  },
};

export const Large: Story = {
  render: () => {
    const [visible, setVisible] = useState(false);
    return (
      <View>
        <Button onPress={() => setVisible(true)}>Open Large Modal</Button>
        <Modal
          visible={visible}
          onClose={() => setVisible(false)}
          size="lg"
          title="Detailed Information"
        >
          <Text>Large modal with more content</Text>
        </Modal>
      </View>
    );
  },
};
```

### Chip Stories

Create `src/components/ui/Chip.stories.tsx`:

```typescript
import React, { useState } from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';
import { Chip } from './Chip';
import { spacing } from '@/theme/tokens';

const meta: Meta<typeof Chip> = {
  title: 'UI/Chip',
  component: Chip,
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'outlined', 'filled'],
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'error'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md'],
    },
    selected: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
  },
  decorators: [
    (Story) => (
      <View style={{ padding: spacing.lg }}>
        <Story />
      </View>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Chip>;

export const Default: Story = {
  args: {
    label: 'Tag',
  },
};

export const Selected: Story = {
  args: {
    label: 'Selected',
    selected: true,
  },
};

export const Removable: Story = {
  args: {
    label: 'Removable',
    onRemove: () => console.log('Remove'),
  },
};

export const Outlined: Story = {
  args: {
    label: 'Outlined',
    variant: 'outlined',
  },
};

export const Filled: Story = {
  args: {
    label: 'Filled',
    variant: 'filled',
  },
};

export const ColorVariants: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
      <Chip label="Primary" color="primary" />
      <Chip label="Secondary" color="secondary" />
      <Chip label="Success" color="success" />
      <Chip label="Error" color="error" />
    </View>
  ),
};

export const SelectableGroup: Story = {
  render: () => {
    const [selected, setSelected] = useState('option1');
    return (
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <Chip
          label="Option 1"
          selected={selected === 'option1'}
          onPress={() => setSelected('option1')}
        />
        <Chip
          label="Option 2"
          selected={selected === 'option2'}
          onPress={() => setSelected('option2')}
        />
        <Chip
          label="Option 3"
          selected={selected === 'option3'}
          onPress={() => setSelected('option3')}
        />
      </View>
    );
  },
};

export const Small: Story = {
  args: {
    label: 'Small',
    size: 'sm',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled',
    disabled: true,
    onPress: () => {},
  },
};
```

## Best Practices

### Story Organization

- Group stories by component category (UI, Screens, Shared)
- Use descriptive story names
- Include all major variants
- Add interactive examples where applicable

### Controls

Use Storybook controls to make stories interactive:

```typescript
argTypes: {
  variant: {
    control: 'select',
    options: ['primary', 'secondary', 'danger'],
  },
  disabled: {
    control: 'boolean',
  },
  size: {
    control: 'select',
    options: ['sm', 'md', 'lg'],
  },
}
```

### Decorators

Use decorators to add consistent padding or context:

```typescript
decorators: [
  (Story) => (
    <View style={{ padding: spacing.lg, backgroundColor: colors.background }}>
      <Story />
    </View>
  ),
],
```

### Documentation

Add documentation to stories using JSDoc:

```typescript
/**
 * Primary button for main call-to-action
 */
export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
  },
};
```

## Testing with Storybook

### Visual Regression Testing

Use Storybook with Chromatic or Percy for visual regression testing:

```bash
# Install Chromatic
npm install --save-dev chromatic

# Run visual tests
npx chromatic --project-token=<your-token>
```

### Accessibility Testing

Use Storybook's accessibility addon:

```bash
npm install --save-dev @storybook/addon-a11y
```

Add to `.storybook/main.js`:

```javascript
module.exports = {
  addons: [
    '@storybook/addon-a11y',
  ],
};
```

## Additional Resources

- [Storybook for React Native](https://storybook.js.org/docs/react-native/get-started/introduction)
- [Component Documentation](./COMPONENT_DOCUMENTATION.md)
- [Design System Guide](./DESIGN_SYSTEM.md)
