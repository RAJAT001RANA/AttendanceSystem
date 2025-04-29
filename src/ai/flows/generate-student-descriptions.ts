'use server';
/**
 * @fileOverview A student description generator AI agent.
 *
 * - generateStudentDescription - A function that handles the student description generation process.
 * - GenerateStudentDescriptionInput - The input type for the generateStudentDescription function.
 * - GenerateStudentDescriptionOutput - The return type for the generateStudentDescription function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GenerateStudentDescriptionInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a student's face, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  studentName: z.string().describe('The name of the student.'),
  additionalDetails: z.string().optional().describe('Any additional details about the student.'),
});
export type GenerateStudentDescriptionInput = z.infer<typeof GenerateStudentDescriptionInputSchema>;

const GenerateStudentDescriptionOutputSchema = z.object({
  description: z.string().describe('A short description of the student based on their facial features and other details.'),
});
export type GenerateStudentDescriptionOutput = z.infer<typeof GenerateStudentDescriptionOutputSchema>;

export async function generateStudentDescription(input: GenerateStudentDescriptionInput): Promise<GenerateStudentDescriptionOutput> {
  return generateStudentDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateStudentDescriptionPrompt',
  input: {
    schema: z.object({
      photoDataUri: z
        .string()
        .describe(
          "A photo of a student's face, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
        ),
      studentName: z.string().describe('The name of the student.'),
      additionalDetails: z.string().optional().describe('Any additional details about the student.'),
    }),
  },
  output: {
    schema: z.object({
      description: z.string().describe('A short description of the student based on their facial features and other details.'),
    }),
  },
  prompt: `You are a helpful assistant tasked with generating short descriptions of students for faculty members.

  Given a student's name, photo, and any additional details, create a concise description that highlights their key facial features and any other relevant information.

  Student Name: {{{studentName}}}
  Additional Details: {{{additionalDetails}}}
  Photo: {{media url=photoDataUri}}

  Description: `,
});

const generateStudentDescriptionFlow = ai.defineFlow<
  typeof GenerateStudentDescriptionInputSchema,
  typeof GenerateStudentDescriptionOutputSchema
>(
  {
    name: 'generateStudentDescriptionFlow',
    inputSchema: GenerateStudentDescriptionInputSchema,
    outputSchema: GenerateStudentDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
