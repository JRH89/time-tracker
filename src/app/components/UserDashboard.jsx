'use client'
import React, { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthProvider'
import { signOut } from 'firebase/auth'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'
import { auth, db } from '../../../firebase'
import { doc, deleteDoc, collection, query, addDoc, onSnapshot, updateDoc } from 'firebase/firestore'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { deleteUser } from 'firebase/auth'
import Image from 'next/image'

const UserDashboard = () => {

	const { currentUser } = useAuth()
	const router = useRouter()

	const [projects, setProjects] = useState([])
	const [completedProjects, setCompletedProjects] = useState([])
	const [newProject, setNewProject] = useState({ title: '', description: '', hourlyRate: 0 })
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [showProductForm, setShowProductForm] = useState(false)
	const [showProjectList, setShowProjectList] = useState(true)
	const [errorMessage, setErrorMessage] = useState('')
	const [isDropdownOpen, setIsDropdownOpen] = useState(false)

	useEffect(() => {
		if (currentUser) {
			// Firestore reference to the user's projects collection
			const projectsRef = collection(db, 'users', currentUser.uid, 'projects')

			// Create a query and listen for real-time updates
			const q = query(projectsRef)

			const unsubscribe = onSnapshot(q, (snapshot) => {
				const updatedProjects = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
				const inProgressProjects = updatedProjects.filter((project) => !project.completed)
				const completedProjects = updatedProjects.filter((project) => project.completed)
				setProjects(inProgressProjects)
				setCompletedProjects(completedProjects)
			})

			return () => unsubscribe()
		}
	}, [currentUser])

	const handleAddProject = async () => {
		if (currentUser) {
			// Firestore reference to the user's projects collection
			const projectsRef = collection(db, 'users', currentUser.uid, 'projects')

			// Add a new project to Firestore
			await addDoc(projectsRef, { ...newProject, completed: false })

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
		} catch (error) {
			setErrorMessage(error.message)
		}
	}

	const handleLogout = async () => {
		signOut(auth)
	}

	const handleForgotPassword = async () => {
		try {
			await sendPasswordResetEmail(auth, email)
			alert('Password reset email sent. Check your inbox.')
		} catch (error) {
			console.error('Password reset email failed:', error.message)
		}
	}

	const handleDeleteAccount = async () => {
		// Display a confirmation dialog to the user
		const shouldDelete = window.confirm(
			'Are you sure you want to delete your account? This action cannot be undone.'
		)

		if (shouldDelete) {
			try {
				if (currentUser) {
					// Delete the user's account
					await deleteUser(auth.currentUser)

					// Redirect the user to the login page or any other appropriate action
					router.push('/') // Replace '/login' with your desired redirection URL
				}
			} catch (error) {
				console.error('Error deleting account:', error.message)
			}
		}
	}

	const handleMarkAsComplete = async (projectId) => {
		try {
			// Find the project to mark as complete
			const projectToComplete = projects.find((project) => project.id === projectId)

			// Update the project's "completed" status in Firestore
			const projectRef = doc(db, 'users', currentUser.uid, 'projects', projectId)
			await updateDoc(projectRef, {
				completed: true, // Set the "completed" field to true
			})

			// Remove the project from the current list
			const updatedProjects = projects.filter((project) => project.id !== projectId)
			setProjects(updatedProjects)

			// Add the project to the completed projects list
			setCompletedProjects([...completedProjects, projectToComplete])
		} catch (error) {
			console.error('Error marking project as complete:', error.message)
		}
	}

	const handleRemove = async (projectId) => {
		try {
			// Remove the project from Firestore
			const projectRef = doc(db, 'users', currentUser.uid, 'projects', projectId)
			await deleteDoc(projectRef)

			// Remove the project from the current list
			const updatedProjects = projects.filter((project) => project.id !== projectId)
			setProjects(updatedProjects)
		} catch (error) {
			console.error('Error removing project:', error.message)
		}
	}

	const handleGuestSignIn = async () => {
		try {
			await signInWithEmailAndPassword(auth, "guest@guest.com", "Guest123!")
		} catch (error) {
			setErrorMessage(error.message)
		}
	}

	const openDropdown = () => {
		setIsDropdownOpen(!isDropdownOpen)
	}

	return (
		<div className="bg-stone-300 min-h-screen flex flex-col justify-center gap-5 sm:gap-10 items-center p-2">
			{currentUser &&
				<div className="flex flex-row gap-3 w-full max-w-4xl mx-auto justify-center">
					<button
						className="sm:px-4 sm:py-2 p-1 text-gray-800 bg-blue-400 rounded-lg shadow-md hover:bg-blue-600 w-full font-bold"
						onClick={() => {
							setShowProjectList(false)
							setShowProductForm(true)
						}}
					>
						New Project
					</button>
					<button
						onClick={() => {
							setShowProductForm(false)
							setShowProjectList(true)
						}}
						className="sm:px-4 sm:py-2 p-1 text-gray-800 bg-green-400 rounded-lg shadow-md hover:bg-green-600 w-full font-bold"
					>
						Projects
					</button>

				</div>
			}
			{!currentUser && (
				<div className="flex flex-col items-center gap-3 text-center">
					<h1 className="text-2xl font-semibold mb-4 text-gray-800">Login</h1>
					<input
						type="email"
						placeholder="Email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						className="p-2 rounded-lg text-gray-800 bg-white w-64"
					/>
					<input
						type="password"
						placeholder="Password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className="p-2 rounded-lg text-gray-800 bg-white w-64"
					/>
					<div className="flex flex-row gap-3 w-full">
						<button
							className="px-4 py-2 text-gray-800 bg-green-400 rounded-lg shadow-md hover:bg-green-600 w-full"
							onClick={handleLogin}
						>
							Login
						</button>
						<button
							className="px-4 py-2 text-gray-800 bg-blue-400 rounded-lg shadow-md hover:bg-blue-600 w-full"
							onClick={handleSignup}
						>
							Signup
						</button>
					</div>
					<button
						onClick={handleGuestSignIn}
						className="px-4 py-2 text-gray-800 bg-red-400 rounded-lg shadow-md hover:bg-red-600 w-full"
					>
						Guest
					</button>
					<button
						onClick={handleForgotPassword}
						className="text-gray-800 hover:underline"
					>
						Forgot Password?
					</button>
				</div>
			)}
			{currentUser && (
				<div className="w-full max-w-4xl mx-auto p-8 bg-white shadow-black rounded-lg shadow-lg mt-4">
					<div className="">
						<div className="flex bg-gray-800 justify-between pl-2 pr-2 items-center fixed top-0 py-2 left-0 right-0">
							<div className='flex flex-row align-middle'>
								<i className='rounded-md align-middle self-center my-auto flex'><Image
									className='rounded-sm mr-2'
									width={18}
									height={18}
									src={"/favicon.ico"}
								/></i>
								<h1 className='font-bold md:text-3xl'>Time Tracker</h1>
							</div>

							<button onClick={openDropdown} className="rounded-full px-2 font-bold hover:scale-95 duration-200">
								<i className="fa-solid align-middle self-center my-auto md:text-3xl fa-bars text-transparent bg-gradient-to-b from-blue-600 via-green-600 to-red-500 bg-clip-text text-2xl" />
							</button>
						</div>
						{isDropdownOpen && (
							<div className='p-4 bg-gray-800 fixed top-12 md:top-14 right-1 rounded-lg shadow-lg'>
								<div className='flex flex-col gap-3'>
									<button
										className='bg-green-400 p-1 rounded-md hover:bg-green-600 text-gray-800'
										onClick={handleLogout}
									>
										Logout
									</button>
									<button
										onClick={handleDeleteAccount}
										className='bg-red-400 hover:bg-red-600 p-1 rounded-md text-gray-800'
									>
										Delete Account
									</button>
								</div>
							</div>
						)}
					</div>
					{showProductForm && !showProjectList && (
						<div className="flex flex-col gap-2">
							<input
								type="text"
								placeholder="Title"
								value={newProject.title}
								onChange={(e) =>
									setNewProject({ ...newProject, title: e.target.value })
								}
								className="p-2 rounded-lg text-gray-800 bg-white border border-neutral-800"
							/>
							<textarea
								rows={4}
								placeholder="Description"
								value={newProject.description}
								onChange={(e) =>
									setNewProject({ ...newProject, description: e.target.value })
								}
								className="p-2 rounded-lg text-gray-800 bg-white border-neutral-800 border"
							/>
							<input
								type="number"
								placeholder="Hourly Rate"
								value={newProject.hourlyRate}
								onChange={(e) =>
									setNewProject({ ...newProject, hourlyRate: e.target.value })
								}
								className="p-2 rounded-lg text-gray-800 bg-white border border-neutral-800"
							/>
							<button
								className="sm:px-4 sm:py-2 p-1 text-gray-800 bg-green-400 rounded-lg shadow-md hover:bg-green-600 self-center w-1/2"
								onClick={handleAddProject}
							>
								Add Project
							</button>
						</div>
					)}
					{showProjectList && !showProductForm && (
						<div className="mt-4">
							<h3 className="text-xl mt-4 text-center text-gray-800 font-bold">
								Current Projects:
							</h3>
							<ul className="space-y-3 mt-4 flex-wrap">
								{projects.map((project, index) => (
									<li
										key={project.id}
										className="pb-4 border-b border-neutral-300 flex flex-wrap"
									>
										<div className="flex flex-row justify-between gap-3 sm:gap-10 w-full">
											<p className="text-lg text-gray-800 w-full">
												<strong>
													{index + 1}.&nbsp;&nbsp;{project.title}
												</strong>
											</p>
											<p className="text-gray-800 w-full hidden sm:block">{project.description}</p>
											<p className="text-gray-800 w-full hidden sm:block">${project.hourlyRate}</p>
											<button
												className="sm:px-2 sm:py-2 p-1 text-gray-800 bg-green-400 rounded-lg shadow-md hover:bg-green-600 text-sm sm:text-base my-auto"
												onClick={() => handleMarkAsComplete(project.id)}
											>
												Complete
											</button>
											<Link
												className="sm:px-4 sm:py-2 p-1 bg-blue-400 text-gray-800 rounded-lg text-sm sm:text-base hover:bg-blue-600 my-auto"
												href={`/project/${project.id}`}
											>
												Open
											</Link>
										</div>
									</li>
								))}
							</ul>
							<h3 className="text-xl mt-8 text-center text-gray-800 font-bold">
								Completed Projects:
							</h3>
							<ul className="space-y-3 mt-4">
								{completedProjects.map((project, index) => (
									<li
										key={project.id}
										className="pb-4 border-b border-neutral-300"
									>
										<div className="flex flex-row justify-between gap-3 sm:gap-10 w-full">
											<p className="text-lg text-gray-800 w-full">
												<strong>
													{index + 1}.&nbsp;&nbsp;{project.title}
												</strong>
											</p>
											<p className="text-gray-800 w-full hidden sm:block">{project.description}</p>
											<p className="text-gray-800 w-full hidden sm:block">${project.hourlyRate}</p>
											<button
												className="sm:px-4 sm:py-2 p-1 px-2  text-gray-800 bg-green-400 my-auto rounded-lg shadow-md hover:bg-green-600 text-sm sm:text-base"
												onClick={() => handleRemove(project.id)}
											>
												Remove
											</button>
											<Link
												className="sm:px-4 sm:py-2 p-1 bg-blue-400 text-gray-800 align-middle my-auto rounded-lg hover:bg-blue-600 text-sm sm:text-base"
												href={`/project/${project.id}`}
											>
												Open
											</Link>
										</div>
									</li>
								))}
							</ul>
						</div>
					)}
				</div>
			)}
		</div>
	)
}

export default UserDashboard
