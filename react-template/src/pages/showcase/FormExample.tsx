// Esempio: form completo con react-hook-form + Zod (text, select, radio, checkbox, switch, textarea).
// Controller serve per i componenti "controllati" (value/onChange) come RadioGroup.
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  Button,
  Checkbox,
  Input,
  RadioGroup,
  Select,
  Switch,
  Textarea,
  useToast,
} from '@/components/ui';

import styles from './Showcase.module.css';
import { ShowcaseSection } from './ShowcaseSection';

const signupSchema = z.object({
  fullName: z.string().trim().min(2, 'Enter at least 2 characters'),
  email: z.email('Enter a valid email address'),
  role: z.string().min(1, 'Choose a role'),
  plan: z.enum(['free', 'pro'], { error: 'Choose a plan' }),
  bio: z.string().max(200, 'Keep it under 200 characters'),
  newsletter: z.boolean(),
  terms: z.boolean().refine((value) => value, 'You must accept the terms'),
});

type SignupValues = z.infer<typeof signupSchema>;

const ROLE_OPTIONS = [
  { value: 'developer', label: 'Developer' },
  { value: 'designer', label: 'Designer' },
  { value: 'manager', label: 'Manager' },
];

const PLAN_OPTIONS = [
  { value: 'free', label: 'Free' },
  { value: 'pro', label: 'Pro' },
];

const CODE = `
const schema = z.object({
  email: z.email('Enter a valid email address'),
  terms: z.boolean().refine((v) => v, 'You must accept the terms'),
});

const { register, control, handleSubmit, formState: { errors } } =
  useForm({ resolver: zodResolver(schema) });

<form onSubmit={handleSubmit(onSubmit)} noValidate>
  <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
  <Select label="Role" options={roles} placeholder="Choose…" {...register('role')} />
  <Controller name="plan" control={control} render={({ field }) => (
    <RadioGroup label="Plan" options={plans} value={field.value} onChange={field.onChange} />
  )} />
  <Textarea label="Bio" {...register('bio')} />
  <Switch label="Newsletter" {...register('newsletter')} />
  <Checkbox label="I accept the terms" {...register('terms')} error={errors.terms?.message} />
  <Button type="submit">Submit</Button>
</form>
`;

export function FormExample() {
  const { showToast } = useToast();
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '',
      email: '',
      role: '',
      plan: 'free',
      bio: '',
      newsletter: true,
      terms: false,
    },
  });

  const onSubmit = handleSubmit((values) => {
    showToast({
      title: 'Form submitted',
      description: `Welcome, ${values.fullName}!`,
      variant: 'success',
    });
    reset();
  });

  return (
    <ShowcaseSection
      id="forms"
      title="Form fields with validation"
      description="Submit the empty form to see the validation messages."
      code={CODE}
    >
      <form onSubmit={onSubmit} noValidate className={styles.formGrid} aria-label="Sign up example">
        <Input
          label="Full name"
          required
          {...register('fullName')}
          error={errors.fullName?.message}
        />
        <Input
          label="Email"
          type="email"
          required
          {...register('email')}
          error={errors.email?.message}
        />
        <Select
          label="Role"
          required
          placeholder="Choose…"
          options={ROLE_OPTIONS}
          {...register('role')}
          error={errors.role?.message}
        />
        <Controller
          name="plan"
          control={control}
          render={({ field }) => (
            <RadioGroup
              label="Plan"
              orientation="horizontal"
              options={PLAN_OPTIONS}
              name={field.name}
              value={field.value}
              onChange={field.onChange}
              {...(errors.plan?.message ? { error: errors.plan.message } : {})}
            />
          )}
        />
        <div className={styles.full}>
          <Textarea
            label="Bio"
            hint="Optional, max 200 characters."
            {...register('bio')}
            error={errors.bio?.message}
          />
        </div>
        <Switch label="Subscribe to the newsletter" {...register('newsletter')} />
        <Checkbox label="I accept the terms" {...register('terms')} error={errors.terms?.message} />
        <div className={styles.full}>
          <Button type="submit" loading={isSubmitting}>
            Submit
          </Button>
        </div>
      </form>
    </ShowcaseSection>
  );
}
