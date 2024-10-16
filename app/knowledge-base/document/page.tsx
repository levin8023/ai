'use client'

import React, { useEffect, useState } from 'react'

export default function KnowledgeBasePage () {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>(
    'idle')
  const [documents, setDocuments] = useState<any[]>([])
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([])
  const [filter, setFilter] = useState('')

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/knowledge-base/document')
      const data = await response.json()
      setDocuments(data)
    } catch (error) {
      console.error('Failed to fetch documents', error)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
      setUploadStatus('idle')
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/knowledge-base/document', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        setUploadStatus('success')
        fetchDocuments()
      } else {
        setUploadStatus('error')
      }
    } catch (error) {
      setUploadStatus('error')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async () => {
    if (selectedDocuments.length === 0) return

    try {
      const response = await fetch('/api/knowledge-base/document', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selectedDocuments),
      })

      if (response.ok) {
        await fetchDocuments()
        setSelectedDocuments([])
      } else {
        console.error('Failed to delete documents')
      }
    } catch (error) {
      console.error('Failed to delete documents', error)
    }
  }

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value)
  }

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(filter.toLowerCase()),
  )

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Manage Knowledge
        Base Documents</h2>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2"
               htmlFor="file-upload">
          Choose a file
        </label>
        <div className="flex items-center justify-center w-full">
          <label htmlFor="file-upload"
                 className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
            <div
              className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true"
                   xmlns="http://www.w3.org/2000/svg" fill="none"
                   viewBox="0 0 20 16">
                <path stroke="currentColor" strokeLinecap="round"
                      strokeLinejoin="round" strokeWidth="2"
                      d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
              </svg>
              <p className="mb-2 text-sm text-gray-500"><span
                className="font-semibold">Click to upload</span> or drag and
                drop</p>
              <p className="text-xs text-gray-500">PDF, DOCX, TXT, CSV, JSON</p>
            </div>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.txt"
            />
          </label>
        </div>
      </div>
      {file && (
        <p className="text-sm text-gray-600 mb-4">
          Selected file: {file.name}
        </p>
      )}
      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
          (!file || uploading) ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
      {uploadStatus === 'success' && (
        <div
          className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          File uploaded successfully!
        </div>
      )}
      {uploadStatus === 'error' && (
        <div
          className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          Failed to upload file. Please try again.
        </div>
      )}

      <div className="mt-8">
        <input
          type="text"
          placeholder="Filter by name"
          value={filter}
          onChange={handleFilterChange}
          className="w-full p-2 mb-4 border border-gray-300 rounded"
        />
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
          <tr>
            <th
              className="hidden px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Select
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ID
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created At
            </th>
          </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
          {filteredDocuments.map(doc => (
            <tr key={doc.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={selectedDocuments.includes(doc.id)}
                  onChange={() => {
                    if (selectedDocuments.includes(doc.id)) {
                      setSelectedDocuments(
                        selectedDocuments.filter(id => id !== doc.id))
                    } else {
                      setSelectedDocuments([...selectedDocuments, doc.id])
                    }
                  }}
                />
              </td>
              <td className="hidden px-6 py-4 text-black">{doc.id}</td>
              <td className="px-6 py-4 text-black">{doc.name}</td>
              <td className="px-6 py-4 text-black">{doc.type}</td>
              <td className="px-6 py-4 text-black">{doc.created_at}</td>
            </tr>
          ))}
          </tbody>
        </table>
        <button
          onClick={handleDelete}
          disabled={selectedDocuments.length === 0}
          className={`mt-4 w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
            selectedDocuments.length === 0
              ? 'opacity-50 cursor-not-allowed'
              : ''
          }`}
        >
          Delete Selected
        </button>
      </div>
    </div>
  )
}

