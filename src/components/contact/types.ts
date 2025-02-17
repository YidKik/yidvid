
import { z } from "zod";

export const formSchema = z.object({
  category: z.enum(['bug_report', 'feature_request', 'support', 'general'], {
    required_error: "Please select a category",
  }),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export type FormValues = z.infer<typeof formSchema>;

export const categoryOptions = [
  {
    value: 'bug_report' as const,
    label: 'Report a Bug',
    description: 'Found something not working correctly?'
  },
  {
    value: 'feature_request' as const,
    label: 'Request a Feature',
    description: 'Have an idea for improving the platform?'
  },
  {
    value: 'support' as const,
    label: 'Get Support',
    description: 'Need help using the platform?'
  },
  {
    value: 'general' as const,
    label: 'General Inquiry',
    description: 'Any other questions or feedback'
  }
];
