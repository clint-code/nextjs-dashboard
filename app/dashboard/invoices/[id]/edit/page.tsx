import Form from '@/app/ui/invoices/edit-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { fetchInvoiceById, fetchCustomers } from '@/app/lib/data';
import { notFound } from 'next/navigation';

/**
 * Page components accept a prop called params 
 * which you can use to access the id
 */

export default async function Page(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const id = params.id;

    const [invoice, customers] = await Promise.all([
        fetchInvoiceById(id),
        fetchCustomers()
    ]);

    if(!invoice){
        /**notFound() allows you to render the not-found file 
         * within a route segment and inject a 
         * <meta name="robots" content="noindex" /> tag which means 
         * that the page shouldn't appear in search engine results
         * */
        notFound();
    }

    return (
        <main>
            <Breadcrumbs
                breadcrumbs = {[
                    {label: 'Invoices', href: '/dashboard/invoices'},
                    {
                        label: 'Edit Invoice',
                        href: `/dashboard/invoices/${id}/edit`,
                        active: true,
                    },
                ]}
            />
            <Form invoice={invoice} customers={customers} />
        </main>
    )
}