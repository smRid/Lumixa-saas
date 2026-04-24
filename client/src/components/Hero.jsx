import { useNavigate } from "react-router-dom";
import { Sparkles, Play, Check } from "lucide-react";

const Hero = () => {
    const navigate = useNavigate();

    return (
        <div className='relative min-h-screen flex flex-col justify-center overflow-hidden bg-[#0D0B1E]'>
            {/* Animated gradient orbs */}
            <div className='absolute inset-0 overflow-hidden'>
                <div className='absolute -top-40 -right-40 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px]'></div>
                <div className='absolute top-1/3 -left-40 w-[400px] h-[400px] bg-pink-600/20 rounded-full blur-[100px]'></div>
                <div className='absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-blue-600/15 rounded-full blur-[80px]'></div>
            </div>

            {/* Floating icons decoration */}
            <div className='absolute inset-0 overflow-hidden pointer-events-none'>
                <div className='absolute top-32 left-16 w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center shadow-lg animate-bounce' style={{ animationDelay: '0s', animationDuration: '3s' }}>
                    <span className='text-white text-xl'>▶</span>
                </div>
                <div className='absolute top-40 right-20 w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg animate-bounce' style={{ animationDelay: '0.5s', animationDuration: '3.5s' }}>
                    <Sparkles className='w-6 h-6 text-white' />
                </div>
                <div className='absolute bottom-40 left-24 w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg animate-bounce' style={{ animationDelay: '1s', animationDuration: '4s' }}>
                    <span className='text-white text-sm font-bold'>HD</span>
                </div>
                <div className='absolute bottom-32 right-32 w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg animate-bounce' style={{ animationDelay: '1.5s', animationDuration: '3.2s' }}>
                    <span className='text-white text-lg font-bold'>Ps</span>
                </div>
            </div>

            <div className='relative z-10 px-4 sm:px-20 xl:px-32 pt-24'>
                {/* Badge */}
                <div className='flex justify-center mb-8'>
                    <div className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30'>
                        <Sparkles className='w-4 h-4 text-yellow-400' />
                        <span className='text-sm text-yellow-400 font-medium'>New Features Available</span>
                    </div>
                </div>

                {/* Main heading */}
                <div className='text-center mb-8'>
                    <h1 className='text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mx-auto leading-[1.1] tracking-tight'>
                        <span className='text-white'>Create amazing photos</span>
                        <br />
                        <span className='text-white'>with </span>
                        <span className='bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent'>AI tools</span>
                    </h1>
                    <p className='mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-gray-400 leading-relaxed'>
                        Generate images, restore old photos, remove backgrounds, enhance details,
                        and blur backgrounds in one workspace.
                    </p>
                </div>

                {/* Features row */}
                <div className='flex flex-wrap justify-center gap-6 mb-8'>
                    {['Easy to Use', 'Fast & Secure', '24/7 Support', 'Free Updates'].map((feature, i) => (
                        <div key={i} className='flex items-center gap-2 text-gray-300'>
                            <Check className='w-5 h-5 text-green-400' />
                            <span>{feature}</span>
                        </div>
                    ))}
                </div>

                {/* CTA Buttons */}
                <div className='flex flex-wrap justify-center gap-4 text-sm'>
                    <button
                        onClick={() => navigate('/ai')}
                        className='group flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white px-8 py-4 rounded-xl font-medium shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 transition-all duration-300 hover:-translate-y-0.5'
                    >
                        Get Started
                    </button>
                    <button className='group flex items-center gap-2 bg-[#1A1730] hover:bg-[#252040] text-white px-8 py-4 rounded-xl font-medium border border-purple-700/50 hover:border-purple-600 transition-all duration-300 hover:-translate-y-0.5'>
                        <Play className='w-5 h-5' />
                        View Demo
                    </button>
                </div>

                {/* Trust badge */}
                <div className='flex items-center justify-center gap-4 mt-12'>
                    <div className='flex -space-x-3'>
                        {['https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=100',
                            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100',
                            'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100'
                        ].map((img, i) => (
                            <img key={i} src={img} alt="user" className='w-10 h-10 rounded-full border-2 border-[#0D0B1E] object-cover' />
                        ))}
                    </div>
                    <span className='text-gray-400'>Trusted by <span className='text-white font-semibold'>10k+</span> people</span>
                </div>
            </div>
        </div>
    )
}

export default Hero
