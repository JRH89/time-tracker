import React from 'react'
import UserDashboard from '../components/UserDashboard'
import Footer from '../components/Footer'

export const metadata = {
    title: 'Dashboard | Time Tracker',
    description: 'Dashboard',
}

function page() {
    return (
        <>
            <UserDashboard />
            <Footer />
        </>
    )
}

export default page