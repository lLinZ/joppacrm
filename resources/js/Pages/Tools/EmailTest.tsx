// <ai_context>
// Propósito: Herramienta para enviar las plantillas de correo a una dirección de prueba
// antes de que lleguen a los postulantes/clientes reales. Útil también para verificar el SMTP.
// Localización: CRM (Admin)
// </ai_context>

import React, { FormEventHandler } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { AppLayout } from '@/Components/ui/AppLayout';
import { PageHeader } from '@/Components/ui/PageHeader';
import { Mail, Send, Info } from 'lucide-react';

interface Template { value: string; label: string }

interface Props {
    templates: Template[];
    fromAddress: string;
    mailer: string;
}

export default function EmailTest({ templates, fromAddress, mailer }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        template: templates[0]?.value ?? '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('tools.email-test.send'), { preserveScroll: true });
    };

    const isLogMode = mailer === 'log';

    return (
        <AppLayout>
            <Head title="Correo de prueba" />

            <PageHeader
                title="Correo de prueba"
                description="Envía cualquiera de las plantillas a tu propio correo para revisar cómo se ve antes de que le llegue a los postulantes."
            />

            <div className="max-w-xl space-y-4">
                {/* Aviso del modo de correo actual */}
                <div className={`rounded-xl border p-4 flex items-start gap-3 ${isLogMode ? 'border-amber-500/20 bg-amber-500/5' : 'border-emerald-500/20 bg-emerald-500/5'}`}>
                    <Info className={`w-4.5 h-4.5 mt-0.5 shrink-0 ${isLogMode ? 'text-amber-400' : 'text-emerald-400'}`} />
                    <div className="text-sm">
                        {isLogMode ? (
                            <>
                                <p className="text-amber-300 font-medium">El correo está en modo <code className="text-amber-200">log</code></p>
                                <p className="text-slate-400 mt-1">
                                    Los correos no se envían de verdad: se escriben en <code className="text-slate-300">storage/logs/laravel.log</code>.
                                    Para enviar de verdad, configura <code className="text-slate-300">MAIL_MAILER=smtp</code> en el <code className="text-slate-300">.env</code> del servidor.
                                </p>
                            </>
                        ) : (
                            <>
                                <p className="text-emerald-300 font-medium">Correo activo por <code className="text-emerald-200">{mailer}</code></p>
                                <p className="text-slate-400 mt-1">Los correos se enviarán desde <span className="text-slate-200 font-medium">{fromAddress}</span>.</p>
                            </>
                        )}
                    </div>
                </div>

                {/* Formulario */}
                <form onSubmit={submit} className="rounded-2xl border border-white/8 bg-white/[0.03] p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Plantilla a probar</label>
                        <select
                            value={data.template}
                            onChange={(e) => setData('template', e.target.value)}
                            className="w-full rounded-xl bg-black/20 border border-white/10 text-slate-200 px-4 py-2.5 focus:border-emerald-400/50 focus:ring-0"
                        >
                            {templates.map((t) => (
                                <option key={t.value} value={t.value} className="bg-slate-900">{t.label}</option>
                            ))}
                        </select>
                        {errors.template && <p className="text-red-400 text-sm mt-1.5">{errors.template}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Enviar a</label>
                        <div className="relative">
                            <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="tu@correo.com"
                                autoFocus
                                className="w-full rounded-xl bg-black/20 border border-white/10 text-slate-200 placeholder:text-slate-600 pl-10 pr-4 py-2.5 focus:border-emerald-400/50 focus:ring-0"
                            />
                        </div>
                        {errors.email && <p className="text-red-400 text-sm mt-1.5">{errors.email}</p>}
                        <p className="text-slate-500 text-xs mt-1.5">Se envía con datos de ejemplo, no afecta a ningún postulante real.</p>
                    </div>

                    <div className="flex justify-end pt-1">
                        <button
                            type="submit"
                            disabled={processing || !data.email}
                            className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-medium text-sm border border-emerald-400/20 hover:border-emerald-400/50 bg-emerald-400/10 px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send className="w-4 h-4" />
                            {processing ? 'Enviando...' : 'Enviar correo de prueba'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
