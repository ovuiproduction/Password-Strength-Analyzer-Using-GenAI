import React, { useState } from 'react';
import axios from 'axios';

import "../css/BulkPassCheck.css";

import { toast } from "react-toastify";

function BulkPassCheck() {
    const [file, setFile] = useState(null);
    const [data,setData] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            alert('Please select a file first!');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('http://localhost:5000/validate-bulk-password', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setData(response.data);
            console.log(response.data);  // You can display result nicely
            toast.success('Validation Completed! Check console for output.');
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Error uploading file.');
        }
    };

    return (
        <div className="password-upload-container">
            <header className="upload-header">
                <h1>Bulk Password Validator</h1>
                <p className="subtitle">Upload a CSV file containing passwords to validate their strength</p>
            </header>

            <div className="upload-card">
                <form onSubmit={handleSubmit} className="upload-form">
                    <div className="form-group">
                        <label htmlFor="csv-upload" className="file-input-label">
                            {!file && (<span className="file-input-text">Choose CSV File</span>)}
                            <input
                                id="csv-upload"
                                type="file"
                                accept=".csv"
                                onChange={handleFileChange}
                                className="file-input"
                            />
                            {file && (<>{file.name}</>)}
                        </label>
                        <p className="file-requirements">CSV must contain a "password" column</p>
                    </div>

                    <div className="button-group">
                        <button type="submit" className="submit-button">
                            Upload and Validate
                        </button>

                        {data?.outputFile && (
                            <a
                                href={`http://localhost:5000/download/password_status_output.csv`}
                                download="password_validation_results.csv"
                                className="download-button"
                            >
                                Download Results
                            </a>
                        )}
                    </div>
                </form>

                {data?.outputFile && (
                    <div className="results-preview">
                        <h3>Validation Results Preview</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Password</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.outputFile.slice(0, 5).map((row, index) => (
                                    <tr key={index}>
                                        <td>{row.password}</td>
                                        <td className={`status-${row.status.toLowerCase().replace(' ', '-')}`}>
                                            {row.status}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default BulkPassCheck;
