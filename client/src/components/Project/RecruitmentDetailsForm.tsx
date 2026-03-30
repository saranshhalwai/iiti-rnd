import React, { useState, useEffect } from 'react';
import { apiLink } from "../../lib/api";

export default function RecruitmentDetailsForm({ projectId }: { projectId: string }) {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    position: '',
    count: '',
    basicSalary: '',
    hra: '',
  });

  useEffect(() => {
    const fetchExistingDetails = async () => {
      try {
        const res = await fetch(`${apiLink}/api/project/${projectId}/recruitmentVacancies`, {
          credentials: "include",
        });    

        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            const v = data[0];
            setFormData({
              position: v.position || '',
              count: v.count?.toString() || '',
              basicSalary: v.basicSalary?.toString() || '',
              hra: v.hraPercent?.toString() || '',
            });
          }
        }
      } catch (err) {
        console.error("Error fetching vacancies:", err);
      } finally {
        setFetching(false);
      }
    };

    fetchExistingDetails();
  }, [projectId]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {      
      const payload = {
        vacancies: [
          {
            position: formData.position,
            count: parseInt(formData.count),
            basicSalary: parseFloat(formData.basicSalary),
            hraPercent: parseFloat(formData.hra),
          }
        ]
      };

      const res = await fetch(`${apiLink}/api/project/${projectId}/recruitmentVacancies`, {
        method: "POST",
        credentials:"include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("Details saved successfully!");
      } else {
        const errorData = await res.json();
        alert(errorData.message || "Failed to save");
      }
    } catch (err) {
      console.error("Submit Error:", err);
      alert("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (fetching) return <div className="text-center py-10 text-gray-500">Loading vacancy details...</div>;

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-4 border-b pb-2">
        <h2 className="text-xl font-semibold text-gray-800">Recruitment Vacancy Details</h2>
        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">Step 2</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Position / Designation</label>
          <input
            type="text"
            name="position"
            placeholder="e.g. JRF, SRF, Project Associate"
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500"
            value={formData.position}
            onChange={handleChange}
            disabled={loading}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Number of People</label>
            <input
              type="number"
              name="count"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={formData.count}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Basic Salary (Monthly)</label>
            <input
              type="number"
              name="basicSalary"
              placeholder="₹"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={formData.basicSalary}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">HRA (%)</label>
          <input
            type="number"
            name="hra"
            placeholder="e.g. 16 or 24"
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500"
            value={formData.hra}
            onChange={handleChange}
            disabled={loading}
            required
          />
        </div>

        {/* Dynamic Calculation Preview */}
        {formData.basicSalary && formData.hra && (
          <div className="bg-gray-50 p-3 rounded-md border border-dashed border-gray-300 text-sm">
            <p className="text-gray-600 italic">Estimated Monthly CTC per person:</p>
            <p className="text-lg font-bold text-green-700">
              ₹{(parseFloat(formData.basicSalary) + (parseFloat(formData.basicSalary) * parseFloat(formData.hra) / 100)).toLocaleString()}
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full text-white py-2 px-4 rounded-md transition-all font-semibold shadow-md ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-700 hover:bg-blue-800 active:scale-95"
          }`}
        >
          {loading ? "Saving..." : "Save Recruitment Details"}
        </button>
      </form>
    </div>
  );
}