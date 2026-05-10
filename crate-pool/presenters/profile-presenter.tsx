"use client"

import ProfileView from "@/views/profile-view"

export default function ProfilePresenter() {
    return (

        <div className="w-full mx-auto container">
            <h1 className="text-2xl font-bold mb-4">Profile</h1>
            <ProfileView />
        </div>

    )
}