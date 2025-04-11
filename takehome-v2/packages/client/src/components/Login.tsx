import React from 'react'
import { authApi } from '../api/auth'
import { Navigate } from '@tanstack/react-router'
import { motion } from 'motion/react'
import GardenBlackTextLogo from '../assets/garden-black-text-logo.png'
import { TextInput } from './TextInput'
import { useQuery } from '@tanstack/react-query'

export function Login() {
    const [username, setUsername] = React.useState('')
    const [password, setPassword] = React.useState('')

    const userQuery = useQuery({ ...authApi.whoamiQueryOptions() })
    const isAuthenticated = userQuery.isSuccess && userQuery.data.status === 'authenticated'

    const login = authApi.useLogin()

    if (isAuthenticated) {
        return <Navigate to='/dashboard' />
    }

    return (
        <div className='grid grid-cols-[2fr_1fr] w-screen h-screen'>
            <div className='bg-baby-powder flex flex-col items-center justify-center w-full h-full py-8 px-16 lg:px-32'>
                <div className='flex flex-col gap-4 font-nunitoSans'>
                    <p className='text-primary-100 text-2xl font-bold lg:text-4xl'>Welcome to Garden.</p>
                    <p className='text-black font-semibold text-sm lg:text-lg'>
                        This is the Garden take home assignment. One of our key capabilities as a company is our ability to collect and curate datasets for
                        various products and technologies that are relevant to the patents of our clients, and this assignment is designed to mirror that
                        capability.
                    </p>
                    <p className='text-black font-semibold text-sm lg:text-lg'>
                        Your goal is to use your knowledge of full stack web development to build a tool for the collection, processing, and curation of source
                        documents located on the internet.
                    </p>
                    <p className='text-black font-semibold text-sm lg:text-lg'>Good luck! - Justin</p>
                </div>
            </div>
            <div className='bg-white p-8 flex flex-col h-full w-full items-center justify-center gap-10'>
                <img className='h-12' src={GardenBlackTextLogo} alt='Garden Logo' />
                <h1 className='text-xl font-bold font-nunitoSans'>Sign in to your account</h1>
                <form
                    className='flex flex-col gap-6 items-center justify-center w-full'
                    onSubmit={async (e) => {
                        e.preventDefault()
                        login.mutate({ username, password })
                    }}
                >
                    <TextInput label='Username' value={username} onChange={(e) => setUsername(e.target.value)} width='100%' />
                    <TextInput
                        label='Password'
                        autoComplete='current-password'
                        value={password}
                        isPassword
                        onChange={(e) => setPassword(e.target.value)}
                        width='100%'
                    />
                    <motion.button
                        type='submit'
                        className='w-full font-nunitoSans text-white text-sm font-semibold flex flex-row items-center justify-center rounded-md p-2 hover:cursor-pointer'
                        initial={{ backgroundColor: 'var(--color-primary-100)' }}
                        animate={{ backgroundColor: 'var(--color-primary-100)' }}
                        whileHover={{ backgroundColor: 'var(--color-primary-120)' }}
                        transition={{ duration: 0.1 }}
                        disabled={login.isPending}
                    >
                        Sign in
                    </motion.button>
                </form>
            </div>
        </div>
    )
}
