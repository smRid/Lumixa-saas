import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useClerk, UserButton, useUser } from '@clerk/clerk-react'

const Navbar = () => {

  const navigate = useNavigate()
  const { user } = useUser()
  const { openSignIn } = useClerk()

  return (
    <div className='fixed z-50 w-full bg-[#0D0B1E]/90 backdrop-blur-xl border-b border-purple-900/30 flex justify-between items-center py-4 px-4 sm:px-20 xl:px-32'>
      <div className='flex items-center gap-2 cursor-pointer' onClick={() => navigate('/')}>
        <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-cyan-500/20'>
          <span className='text-white font-bold text-lg'>P</span>
        </div>
        <span className='text-white font-semibold text-xl hidden sm:block'>Photonix AI</span>
      </div>

      {
        user ? <UserButton showName appearance={{
          elements: {
            userButtonBox: 'text-white',
            userButtonOuterIdentifier: 'text-gray-300'
          }
        }} />
          :
          (
            <button onClick={openSignIn} className='flex items-center gap-2 rounded-full text-sm cursor-pointer bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white px-8 py-2.5 shadow-lg shadow-pink-500/25 transition-all duration-300'>
              Get started
              <ArrowRight className='w-4 h-4' /> </button>
          )
      }
    </div>
  )
}

export default Navbar
