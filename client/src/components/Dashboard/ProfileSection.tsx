const ProfileSection = ({ user }: any) => (
  <div className="bg-white shadow-md rounded-2xl p-6 mt-8">
    <h2 className="text-xl font-semibold mb-4">Profile</h2>
    <p className="text-gray-600">Name: {user?.name}</p>
    <p className="text-gray-600">Email: {user?.email}</p>
  </div>
)
export default ProfileSection
