const TabBar = ({ currentTab, setCurrentTab }: any) => {
  const tabs = ["Projects", "Forms", "Approvals", "Profile"]

  return (
    <div className="w-full bg-white shadow-sm border-b border-gray-200">
      <ul className="flex justify-center">
        {tabs.map(tab => (
          <li
            key={tab}
            onClick={() => setCurrentTab(tab)}
            className={`cursor-pointer px-10 py-4 text-lg font-medium transition-colors duration-200
              ${
                currentTab === tab
                  ? "bg-blue-600 text-white shadow-inner"
                  : "text-gray-700 hover:bg-blue-50"
              }`}
          >
            {tab}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default TabBar