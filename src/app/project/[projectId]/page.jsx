'use client'
import React, { useState, useEffect } from 'react'
import { auth, db } from '../../../../firebase'
import {
	doc,
	getDoc,
	updateDoc,
} from 'firebase/firestore'
import { useAuth } from '@/context/AuthProvider'
import { useRouter } from 'next/navigation'

const ProjectDetails = () => {
	const { currentUser } = useAuth()
	const router = useRouter()
	const [projectId, setProjectId] = useState(null) // Use state to store projectId
	const [project, setProject] = useState(null)
	const [sessionHours, setSessionHours] = useState(0)
	const [sessionMinutes, setSessionMinutes] = useState(0)
	const [sessionSeconds, setSessionSeconds] = useState(0)
	const [totalHours, setTotalHours] = useState(0)
	const [totalMinutes, setTotalMinutes] = useState(0)
	const [totalSeconds, setTotalSeconds] = useState(0)
	const [sessionTimer, setSessionTimer] = useState(0)
	const [isTimerRunning, setIsTimerRunning] = useState(false)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		// Extract projectId when the component mounts
		const currentUrl = window.location.href
		const extractedProjectId = currentUrl.substring(currentUrl.lastIndexOf('/') + 1)
		setProjectId(extractedProjectId)
	}, [])

	useEffect(() => {
		if (currentUser && projectId) {
			const fetchProjectDetails = async () => {
				try {
					const projectRef = doc(
						db,
						'users',
						currentUser.uid,
						'projects',
						projectId
					)
					const projectDoc = await getDoc(projectRef)

					if (projectDoc.exists()) {
						const projectData = projectDoc.data()
						setProject(projectData)
						const totalTime = projectData.time || 0
						setTotalHours(Math.floor(totalTime / 3600))
						setTotalMinutes(Math.floor((totalTime % 3600) / 60))
						setTotalSeconds(totalTime % 60)
					}
				} catch (error) {
					console.error('Error fetching project details:', error)
				} finally {
					setIsLoading(false)
				}
			}

			fetchProjectDetails()
		}
	}, [currentUser, projectId])

	const handleStartTimer = () => {
		setIsTimerRunning(true)

		const sessionTimerInterval = setInterval(() => {
			setSessionSeconds((prevSeconds) => {
				let newSeconds = prevSeconds + 1
				if (newSeconds === 60) {
					newSeconds = 0
					setSessionMinutes((prevMinutes) => {
						let newMinutes = prevMinutes + 1
						if (newMinutes === 60) {
							newMinutes = 0
							setSessionHours((prevHours) => prevHours + 1)
						}
						return newMinutes
					})
				}
				return newSeconds
			})
		}, 1000)

		setSessionTimer(sessionTimerInterval)
	}



	const handleStopTimer = async () => {
		setIsTimerRunning(false)
		clearInterval(sessionTimer)

		const sessionTimeInSeconds = sessionHours * 3600 + sessionMinutes * 60 + sessionSeconds
		const updatedTotalTime = totalHours * 3600 + totalMinutes * 60 + totalSeconds + sessionTimeInSeconds

		setTotalHours(Math.floor(updatedTotalTime / 3600))
		setTotalMinutes(Math.floor((updatedTotalTime % 3600) / 60))
		setTotalSeconds(updatedTotalTime % 60)
		setSessionHours(0)
		setSessionMinutes(0)
		setSessionSeconds(0)

		if (currentUser) {
			const projectRef = doc(db, 'users', currentUser.uid, 'projects', projectId)
			await updateDoc(projectRef, { time: updatedTotalTime })
		}
	}

	const formatTime = (hours, minutes, seconds) => {
		const formattedHours = String(hours).padStart(2, '0')
		const formattedMinutes = String(minutes).padStart(2, '0')
		const formattedSeconds = String(seconds).padStart(2, '0')
		return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`
	}

	return (
		<div className="bg-stone-300 min-h-screen flex  justify-center items-center">
			<div className="max-w-4xl p-8 bg-white rounded-lg shadow-lg">
				{isLoading ? (
					<p className="text-center text-gray-800 text-xl font-semibold">
						Loading project details...
					</p>
				) : project ? (
					<div className="mx-auto flex flex-col items-center ">
						<button
							className="absolute top-0 right-0 mt-2 mr-2 bg-red-400 text-white rounded-full px-3 py-1 hover:bg-red-600"
							onClick={() => {
								router.push('/')
							}}
						>
							X
						</button>
						<div className="w-full mx-auto mb-4 md:mb-0">
							<h2 className="text-2xl font-semibold text-center mb-4 text-blue-400">
								Project Details
							</h2>
							<p className="mb-2 text-xl text-gray-800">
								<b>Title:</b> {project.title}
							</p>
							<p className="mb-2 text-xl text-gray-800">
								<b>Desc:</b> {project.description}
							</p>
							<p className="mb-2 text-xl text-gray-800">
								<b>Hourly Rate:</b>{' '}
								<span className="text-yellow-600">${project.hourlyRate}</span>
							</p>
							<p className="mb-2 text-xl text-gray-800">
								<b>Total Time:</b>{' '}
								<span className="text-green-600">
									{formatTime(totalHours, totalMinutes, totalSeconds)}
								</span>
							</p>
							<p className="mb-2 text-xl text-gray-800">
								<b>Cost:</b>{' '}
								<span className="text-yellow-600">
									$
									{(
										project.hourlyRate *
										((totalHours + totalMinutes / 60 + totalSeconds / 3600) / 10)
									).toFixed(2)}
								</span>
							</p>
						</div>
						<div className="mt-4 flex flex-col items-center">
							{isTimerRunning ? (
								<button
									className="px-4 py-2 text-white bg-red-400 rounded-lg shadow-md hover:bg-red-600"
									onClick={handleStopTimer}
								>
									Stop Timer
								</button>
							) : (
								<button
									className="px-4 py-2 text-white bg-green-400 rounded-lg shadow-md hover:bg-green-600"
									onClick={handleStartTimer}
								>
									Start Timer
								</button>
							)}
							<p className="mt-4 text-gray-800 text-xl">
								<b>Session Time:</b>{' '}
								<span className="text-green-600">
									{formatTime(sessionHours, sessionMinutes, sessionSeconds)}
								</span>
							</p>
						</div>
					</div>
				) : (
					<p className="text-center text-red-600 text-xl font-semibold">
						Project not found
					</p>
				)}
			</div>
		</div>
	)


}

export default ProjectDetails
