/**
 * By adding 'use server' at the top of the file, 
 * you mark all the exported functions within the file 
 * as Server Actions.
 * The server functions can be imported and used in Server 
 * and Client Components and they can run on the server side.
 */
'use server';

import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

const FormSchema = z.object({
    id: z.string(),
    customerId: z.string({
        invalid_type_error: 'Please select a customer.'
    }),
    amount: z.coerce
        .number()
        .gt(0, { message: 'Please enter an amount greater than $0.' }),
    status: z.enum(['pending', 'paid'], {
        invalid_type_error: 'Please select an invoice status.',
    }),
    date: z.string()
});

/**
 * The State type describes the shape of the object that manages 
 * the state, in the context of handling form errors and messages.
 * These arrays are intended to hold the error messages related 
 * to the form fields. For the message optional property, it can be 
 * a string or null that can store a general message that's not specific
 * to any particular form field
 */
export type State = {
    errors?: {
        customerId?: string[];
        amount?: string[];
        status?: string[];
    };
    message?: string | null;
};

const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

/**
 * 
 * prevState - contains the state passed from the useActionState hook 
 * 
 */

export async function createInvoice(prevState: State, formData: FormData) {
    // Validate form fields using Zod
    /**safeParse() will return an object containing either 
     * a success or error field helping validation more gracefully 
     * without having put this logic inside the try/catch block
    */
    const validatedFields = CreateInvoice.safeParse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status')
    });

    // If the form validation fails, return the error messages, else continue
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create Invoice.'
        };
    }

    // Prepare data for insertion into the database
    const { customerId, amount, status } = validatedFields.data;

    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0];

    // Insert data into the database
    try {
        await sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;

    } catch (error) {
        console.error('Database Error:', error);
        // If a database error occurs, return a more specific error.    }
        return {
            message: 'Database Error. Failed to Create Invoice.'
        };
    }

    revalidatePath('/dashboard/invoices');

    /**redirect works by throwing an error, which 
    * would be caught by the catch block by calling
    * this after try/catch
    **/
    redirect('/dashboard/invoices');

}

export async function updateInvoice(id: string, prevState: State, formData: FormData) {

    const validatedFields = UpdateInvoice.safeParse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status')
    });

    // If the form validation fails, return the error messages, else continue
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create Invoice.'
        };
    }

    // Prepare data for insertion into the database
    const { customerId, amount, status } = validatedFields.data;

    const amountInCents = amount * 100;

    try {
        await sql`
            UPDATE invoices
            SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
            WHERE id = ${id}
        `;

    } catch (error) {
        console.error('Database Error:', error);
        return {
            message: 'Database Error. Failed to Update Invoice.'
        };
    }

    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
    //throw new Error();

    await sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath('/dashboard/invoices');
}

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        await signIn('credentials', formData);
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials.';
                default:
                    return 'Something went wrong.';
            }
        }
        throw error;
    }
}