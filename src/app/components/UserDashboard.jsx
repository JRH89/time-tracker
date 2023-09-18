'use client'
import React, { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthProvider'
import { signOut } from 'firebase/auth'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { auth, db } from '../../../firebase'
import { getDoc, collection, query, addDoc, onSnapshot } from 'firebase/firestore' // Use getDocs instead of collection
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const UserDashboard = () => {
	const { currentUser } = useAuth()
	const [projects, setProjects] = useState([])
	const [newProject, setNewProject] = useState({ title: '', description: '', hourlyRate: 0 })
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const router = useRouter()
	const [showProductForm, setShowProductForm] = useState(false)
	const [showProjectList, setShowProjectList] = useState(true)
	useEffect(() => {
		if (currentUser) {
			// Firestore reference to the user's projects collection
			const projectsRef = collection(db, 'users', currentUser.uid, 'projects')

			// Create a query and listen for real-time updates
			const q = query(projectsRef)

			const unsubscribe = onSnapshot(q, (snapshot) => {
				const updatedProjects = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
				setProjects(updatedProjects)
			})

			return () => unsubscribe()
		}
	}, [currentUser])

	const handleAddProject = async () => {
		if (currentUser) {
			// Firestore reference to the user's projects collection
			const projectsRef = collection(db, 'users', currentUser.uid, 'projects')

			// Add a new project to Firestore
			await addDoc(projectsRef, newProject)

			// Clear the form
			setNewProject({ title: '', description: '', hourlyRate: 0 })
		}
	}

	const handleLogin = async () => {
		try {
			await signInWithEmailAndPassword(auth, email, password)
		} catch (error) {
			setErrorMessage(error.message)
		}
	}

	const handleSignup = async () => {
		try {
			await createUserWithEmailAndPassword(auth, email, password)
		} catch {
			setErrorMessage(error.message)
		}
	}

	const handleLogout = async () => {
		signOut(auth)
	}

	const handleForgotPassword = async () => {
		try {
			await auth.sendPasswordResetEmail(email)
			alert('Password reset email sent. Check your inbox.')
		} catch (error) {
			console.error('Password reset email failed:', error.message)
		}
	}

	return (
		<div className="flex flex-col items-center justify-center h-screen">
			{!currentUser && (
				<div className='flex flex-col items-center gap-3 text-center'>
					<h1>Login</h1>
					<input
						type="email"
						placeholder="Email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						className='p-1 text-neutral-950'
					/>
					<input
						type="password"
						placeholder="Password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className='p-1 text-neutral-950'
					/>
					<div className='flex flex-row gap-3 w-full'>

						<button className='text-center text-neutral-950 p-1 bg-neutral-300 rounded-sm w-full' onClick={handleLogin}>Login</button>
						<button className='text-center text-neutral-950 p-1 bg-neutral-300 rounded-sm w-full' onClick={handleLogin}>Signup</button>
					</div>
					<button onClick={handleForgotPassword}>Forgot Password?</button>
				</div>
			)}
			{currentUser && (
				<div className='w-full px-12 flex flex-col items-center'>
					<h1 className='text-center'>User Dashboard</h1>
					<div className='flex flex-row gap-3 w-full max-w-3xl mt-4'>
						<button className='text-center text-neutral-950 p-1 bg-neutral-300 rounded-sm w-full'
							onClick={() => {
								setShowProjectList(false)
								setShowProductForm(!showProductForm)
							}}>New Project</button>

						<button onClick={() => {
							setShowProductForm(false)
							setShowProjectList(!showProjectList)
						}} className='text-center text-neutral-950 p-1 bg-neutral-300 rounded-sm w-full'>Projects</button>
						<button
							className='text-center text-neutral-950 p-1 bg-neutral-300 rounded-sm w-full'
							onClick={handleLogout}
						>Logout</button>

					</div>
					{showProductForm && !showProjectList && <>
						<div className='flex flex-col gap-2 mt-4 w-full max-w-3xl'>
							<input
								type="text"
								placeholder="Title"
								value={newProject.title}
								onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
								className='p-1 text-neutral-950 rounded-sm'
							/>
							<input
								type="text"
								placeholder="Description"
								value={newProject.description}
								onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
								className='p-1 text-neutral-950 rounded-sm'
							/>
							<input
								type="number"
								placeholder="Hourly Rate"
								value={newProject.hourlyRate}
								onChange={(e) => setNewProject({ ...newProject, hourlyRate: e.target.value })}
								className='p-1 text-neutral-950 rounded-sm'
							/>
							<button
								className='text-center text-neutral-950 p-1 bg-neutral-300 rounded-sm w-1/2 self-center mt-2'
								onClick={handleAddProject}>Add Project</button>
						</div>
					</>
					}
					{showProjectList && !showProductForm &&

						<ul className='space-y-3 mt-4 w-full max-w-3xl'>
							{projects.map((project, index) => (
								<li key={project.id} className='w-full pb-4 border-b border-neutral-300'>
									<div className='flex flex-row w-full justify-between gap-0 sm:gap-10'>
										<p className='w-full'><strong>{index + 1}.&nbsp;&nbsp;{project.title}</strong></p>

										<p className='w-full'>{project.description}</p>
										<p className='w-full'>${project.hourlyRate}</p>
										<Link className='p-1 bg-neutral-300 text-neutral-950 rounded-sm' href={`/project/${project.id}`}>Open</Link>
									</div>
								</li>
							))}
						</ul>
					}
				</div>
			)}
		</div>
	)
}

export default UserDashboard
