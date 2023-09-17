'use client'
import React, { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthProvider'
import { signOut } from 'firebase/auth'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { auth, db } from '../../../firebase'
import { getDoc, collection, query } from 'firebase/firestore' // Use getDocs instead of collection

const UserDashboard = () => {
	const { currentUser } = useAuth()
	const [projects, setProjects] = useState([])
	const [newProject, setNewProject] = useState({ title: '', description: '', hourlyRate: 0 })
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')

	useEffect(() => {
		if (currentUser) {
			// Firestore reference to the user's projects collection
			const projectsRef = collection(db, 'users', currentUser.uid, 'projects')

			// Real-time listener for projects data
			const unsubscribe = query(projectsRef)

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
			// Try to sign in with the provided email and password
			await signInWithEmailAndPassword(auth, email, password)
		} catch (error) {
			// If the login attempt fails, check if the error indicates that the user doesn't exist
			if (error.code === 'auth/user-not-found') {
				// User doesn't exist, so create a new account
				try {
					await createUserWithEmailAndPassword(auth, email, password)
					// User created successfully, you can now log them in
					await signInWithEmailAndPassword(auth, email, password)
				} catch (createError) {
					console.error('User creation failed:', createError.message)
					// Handle user creation error here (e.g., show an error message)
				}
			} else {
				// Handle other login errors
				console.error('Login failed:', error.message)
				// Handle login error here (e.g., show an error message)
			}
		}
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
		<div>
			{!currentUser && (
				<div className='flex flex-col mx-auto my-auto gap-3 text-center'>
					<h1>Login</h1>
					<input
						type="email"
						placeholder="Email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						className='text-neutral-950 p-1'
					/>
					<input
						type="password"
						placeholder="Password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className='text-neutral-950 p-1'
					/>
					<button onClick={handleLogin}>Login</button>
					<button onClick={handleForgotPassword}>Forgot Password</button>
				</div>
			)}
			{currentUser && (
				<div>
					<h1 className='text-center'>User Dashboard</h1>
					<div className='flex flex-col gap-3'>
						<h2 className='text-center'>New Project</h2>
						<input
							type="text"
							placeholder="Title"
							value={newProject.title}
							onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
							className='p-1 text-neutral-950'
						/>
						<input
							type="text"
							placeholder="Description"
							value={newProject.description}
							onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
							className='p-1 text-neutral-950'
						/>
						<input
							type="number"
							placeholder="Hourly Rate"
							value={newProject.hourlyRate}
							onChange={(e) => setNewProject({ ...newProject, hourlyRate: e.target.value })}
							className='p-1 text-neutral-950'
						/>
						<button onClick={handleAddProject}>Add Project</button>
					</div>
					<div>
						<h2 className='text-center'>Project List</h2>
						<ul>
							{projects.map((project) => (
								<li key={project.id}>
									<strong>{project.title}</strong>
									<p>{project.description}</p>
									<p>Hourly Rate: ${project.hourlyRate}</p>
								</li>
							))}
						</ul>
					</div>
				</div>
			)}
		</div>
	)
}

export default UserDashboard
