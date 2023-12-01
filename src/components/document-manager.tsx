// File: DocumentManager.tsx
import React, { useEffect, useState } from "react";
import {
  uploadContestDocument,
  downloadContestDocument,
  listContestDocuments,
} from "../api-client";

const DocumentManager = () => {
  const [file, setFile] = useState(null);
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    // Fetch the list of documents when the component mounts
    const fetchDocuments = async () => {
      try {
        const docs = await listContestDocuments();
        setDocuments(docs); // Set the fetched documents to state
      } catch (error) {
        console.error("Error fetching documents", error);
      }
    };

    fetchDocuments();
  }, []);
  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleFileUpload = async (event) => {
    event.preventDefault();
    try {
      const response = await uploadContestDocument(file);
      console.log(response);
      // Include filename and fileId in the documents state
      setDocuments([
        ...documents,
        { fileId: response.fileId, filename: file.name },
      ]);
    } catch (error) {
      console.error("Error uploading document", error);
    }
  };

  const handleDownload = async (fileId) => {
    try {
      const fileBlob = await downloadContestDocument(fileId);
      // Create a URL for the blob
      const fileURL = window.URL.createObjectURL(new Blob([fileBlob]));
      // Create a new anchor element
      const fileLink = document.createElement("a");
      fileLink.href = fileURL;
      fileLink.setAttribute("download", "filename.docx"); // Set the file name if you have it, or leave as 'download'
      document.body.appendChild(fileLink);

      fileLink.click(); // Programatically click the link to trigger the download
      fileLink.remove(); // Clean up and remove the link
    } catch (error) {
      console.error("Error downloading document", error);
    }
  };

  return (
    <>
      <div className="add-new-contest">
        <form onSubmit={handleFileUpload}>
          <input
            type="file"
            name="contestDocument"
            accept=".doc,.docx"
            onChange={handleFileChange}
          />
          <button type="submit">Upload Document</button>
        </form>

        <ul>
          {documents.map((doc, index) => (
            <li key={index}>
              {doc.filename}
              <button onClick={() => handleDownload(doc.fileId)}>
                Download
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default DocumentManager;
