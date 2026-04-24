import { useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2, Image, ShieldCheck, Sparkles, Zap } from "lucide-react";

const previewImages = [
    { src: "/preview.png", alt: "AI generated portrait preview", className: "lg:col-span-2" },
    { src: "/preview-2.png", alt: "Background removal preview", className: "" },
    { src: "/preview-3.png", alt: "Photo enhancement preview", className: "" },
    { src: "/preview-4.png", alt: "Restored photo preview", className: "lg:col-span-2" },
];

const stats = [
    { label: "Creative tools", value: "8+" },
    { label: "Fast edits", value: "10x" },
    { label: "Workspace", value: "One" },
];

const features = [
    "Generate original images",
    "Restore and enhance photos",
    "Remove backgrounds and objects",
];

const Hero = () => {
    const navigate = useNavigate();

    return (
        <section className='relative overflow-hidden bg-[#080A12] pt-28 pb-16 sm:pt-32 sm:pb-20'>
            <div className='absolute inset-0 bg-[linear-gradient(135deg,rgba(34,211,238,0.16),transparent_35%,rgba(236,72,153,0.12)_70%,rgba(132,204,22,0.12))]' />
            <div className='absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:48px_48px] opacity-30' />

            <div className='relative z-10 px-4 sm:px-20 xl:px-32'>
                <div className='grid min-h-[78vh] items-center gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(430px,1.05fr)]'>
                    <div>
                        <div className='mb-7 inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-white/[0.08] px-4 py-2 text-sm font-medium text-cyan-100 shadow-lg shadow-cyan-950/20 backdrop-blur'>
                            <Sparkles className='h-4 w-4 text-lime-300' />
                            Modern AI photo studio
                        </div>

                        <h1 className='max-w-4xl text-4xl font-bold leading-[1.08] text-white sm:text-5xl lg:text-6xl'>
                            Photonix AI turns rough ideas into polished visuals.
                        </h1>

                        <p className='mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg'>
                            Generate images, restore old photos, remove distractions, enhance details, and create campaign-ready graphics from one focused workspace.
                        </p>

                        <div className='mt-8 flex flex-col gap-3 sm:flex-row'>
                            <button
                                onClick={() => navigate('/ai')}
                                className='inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-[#080A12] shadow-xl shadow-cyan-500/20 transition hover:-translate-y-0.5 hover:bg-cyan-50'
                            >
                                Start creating
                                <ArrowRight className='h-4 w-4' />
                            </button>
                            <a
                                href="#tools"
                                className='inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.15] bg-white/[0.08] px-6 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:-translate-y-0.5 hover:border-cyan-300/50 hover:bg-white/[0.12]'
                            >
                                <Image className='h-4 w-4' />
                                Explore tools
                            </a>
                        </div>

                        <div className='mt-9 grid gap-3 text-sm text-slate-300 sm:grid-cols-3'>
                            {features.map((feature) => (
                                <div key={feature} className='flex items-center gap-2'>
                                    <CheckCircle2 className='h-4 w-4 shrink-0 text-lime-300' />
                                    <span>{feature}</span>
                                </div>
                            ))}
                        </div>

                        <div className='mt-10 grid max-w-xl grid-cols-3 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.08] backdrop-blur'>
                            {stats.map((stat) => (
                                <div key={stat.label} className='border-r border-white/10 px-4 py-4 last:border-r-0'>
                                    <p className='text-2xl font-bold text-white'>{stat.value}</p>
                                    <p className='mt-1 text-xs uppercase text-slate-400'>{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className='relative'>
                        <div className='rounded-[2rem] border border-white/10 bg-white/[0.08] p-3 shadow-2xl shadow-black/40 backdrop-blur'>
                            <div className='grid grid-cols-2 gap-3'>
                                {previewImages.map((image) => (
                                    <div key={image.src} className={`group overflow-hidden rounded-2xl border border-white/10 bg-[#151A27] ${image.className}`}>
                                        <img
                                            src={image.src}
                                            alt={image.alt}
                                            className='h-44 w-full object-cover transition duration-500 group-hover:scale-105 sm:h-52 lg:h-48 xl:h-56'
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className='mt-4 grid gap-3 sm:grid-cols-2'>
                            <div className='flex items-center gap-3 rounded-2xl border border-white/10 bg-[#101522]/90 px-4 py-3 text-slate-200 shadow-xl shadow-black/20 backdrop-blur'>
                                <span className='flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/15 text-cyan-200'>
                                    <Zap className='h-5 w-5' />
                                </span>
                                <div>
                                    <p className='text-sm font-semibold text-white'>Rapid outputs</p>
                                    <p className='text-xs text-slate-400'>Prompt, preview, refine.</p>
                                </div>
                            </div>
                            <div className='flex items-center gap-3 rounded-2xl border border-white/10 bg-[#101522]/90 px-4 py-3 text-slate-200 shadow-xl shadow-black/20 backdrop-blur'>
                                <span className='flex h-10 w-10 items-center justify-center rounded-xl bg-lime-400/15 text-lime-200'>
                                    <ShieldCheck className='h-5 w-5' />
                                </span>
                                <div>
                                    <p className='text-sm font-semibold text-white'>Private workspace</p>
                                    <p className='text-xs text-slate-400'>Your creations stay yours.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Hero
