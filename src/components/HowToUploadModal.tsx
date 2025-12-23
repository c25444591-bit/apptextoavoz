import React from 'react';
import { X, Upload, Headphones, CheckCircle, ArrowRight, BookOpen, FileText } from 'lucide-react';

interface HowToUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    theme?: string;
}

export const HowToUploadModal: React.FC<HowToUploadModalProps> = ({ isOpen, onClose, theme }) => {
    if (!isOpen) return null;

    const steps = [
        {
            icon: <Upload size={32} className="text-[#1e40af]" />,
            title: "1. Selecciona tu Libro",
            description: "Arrastra tu archivo PDF al área de carga o búscalo en tu computadora haciendo clic en el recuadro."
        },
        {
            icon: <FileText size={32} className="text-blue-600" />,
            title: "2. Procesamiento",
            description: "LibroVoz leerá tu documento automáticamente y lo dividirá en páginas para una navegación fluida."
        },
        {
            icon: <Headphones size={32} className="text-blue-600" />,
            title: "3. ¡A Escuchar!",
            description: "Usa los controles de audio o tu voz para iniciar la lectura. ¡Personaliza la voz a tu gusto!"
        }
    ];

    const bgColor = theme === 'high-contrast' ? 'bg-black' : 'bg-white';
    const textColor = theme === 'high-contrast' ? 'text-yellow-100' : 'text-stone-900';
    const borderColor = theme === 'high-contrast' ? 'border-yellow-400' : 'border-stone-200';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
                aria-hidden="true"
            />

            <div className={`relative w-full max-w-2xl ${bgColor} rounded-[2.5rem] shadow-2xl border-4 ${borderColor} overflow-hidden animate-in zoom-in duration-300`}>
                {/* Header */}
                <div className={`p-6 border-b-4 ${borderColor} flex items-center justify-between`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${theme === 'high-contrast' ? 'bg-yellow-400 text-black' : 'bg-blue-100 text-[#1e40af]'}`}>
                            <BookOpen size={24} />
                        </div>
                        <h2 className={`text-2xl font-black uppercase tracking-tight ${textColor}`}>¿Cómo cargar textos?</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-full hover:bg-black/10 transition-colors ${textColor}`}
                        aria-label="Cerrar guía"
                    >
                        <X size={28} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 sm:p-10 space-y-8">
                    {steps.map((step, index) => (
                        <div key={index} className="flex gap-6 items-start group">
                            <div className={`shrink-0 w-16 h-16 rounded-3xl ${theme === 'high-contrast' ? 'bg-yellow-400 text-black' : 'bg-stone-50 text-[#1e40af]'} flex items-center justify-center border-2 ${borderColor} shadow-inner group-hover:scale-110 transition-transform`}>
                                {step.icon}
                            </div>
                            <div className="space-y-1">
                                <h3 className={`text-xl font-black ${textColor}`}>{step.title}</h3>
                                <p className={`text-lg font-medium opacity-80 leading-snug ${textColor}`}>
                                    {step.description}
                                </p>
                            </div>
                            {index < steps.length - 1 && (
                                <div className="hidden sm:block absolute left-[112px] h-12 w-1 border-l-2 border-dashed border-stone-200 mt-20" />
                            )}
                        </div>
                    ))}

                    <div className={`mt-10 p-6 rounded-3xl border-2 ${borderColor} ${theme === 'high-contrast' ? 'bg-yellow-400/10' : 'bg-green-50'} flex items-center justify-between`}>
                        <div className="flex items-center gap-3">
                            <CheckCircle size={24} className={theme === 'high-contrast' ? 'text-yellow-400' : 'text-green-600'} />
                            <p className={`font-bold ${theme === 'high-contrast' ? 'text-yellow-100' : 'text-green-900'}`}>
                                ¡Ya estás listo para empezar!
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className={`px-6 py-2 rounded-xl font-black uppercase text-sm shadow-md transition-all active:scale-95 ${theme === 'high-contrast' ? 'bg-yellow-400 text-black' : 'bg-stone-900 text-white hover:bg-black'}`}
                        >
                            Entendido
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
