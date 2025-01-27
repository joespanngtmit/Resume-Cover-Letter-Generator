import React, { useRef, useState, useEffect } from "react";
import ErrorPage from "./ErrorPage";
import { useReactToPrint } from "react-to-print";
import { useNavigate } from "react-router-dom";

const Resume = ({ result }) => {
  const componentRef = useRef();
  const navigate = useNavigate();
  const [skills, setSkills] = useState([])

  useEffect(() => {
    if (result) {
      console.log(result);
      setSkills(result.currentTechnologies.split(","));
    }
  }, [result]);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `${result.fullName} Resume`,
    onAfterPrint: () => alert("Print Successful!"),
  });

  if (JSON.stringify(result) === "{}") {
    return <ErrorPage />;
  }

  const replaceWithBr = (string) => {
    return string.replace(/\n/g, "<br />");
  };

  const replaceWithHyphen = (string) => {
    return string
      .split("\n") // Split by newline
      .map((line) => `- ${line.trim()}`) // Add a dash to each line
      .join("<br />"); // Join back with <br /> for line breaks
  };

  const handleGoBack = ()=>{
    navigate("/")
  }

  const handleCopyToClipboard = () => {
    if (result.coverLetter) {
      navigator.clipboard
        .writeText(result.coverLetter)
        .then(() => {
          alert("Cover letter copied to clipboard!");
        })
        .catch((err) => {
          console.error("Failed to copy: ", err);
          alert("Failed to copy to clipboard.");
        });
    } else {
      alert("No cover letter available to copy.");
    }
  };

  return (
    <>
      <div className="buttonContainer">
        <button onClick={handlePrint}>Print Page</button>
        <button onClick={handleGoBack}>Go Back</button>
        <button onClick={handleCopyToClipboard}>Copy Cover Letter</button>
      </div>
      
      <main className="container" ref={componentRef}>
        <header className="header">
          <div>
            <h1>{result.fullName}</h1>
            <h4>{result.city}</h4>
            <br></br>
            <p className="resumeTitle">
              Current Position: {result.currentLength} year(s)
            </p>
            <p className="resumeTitle">
              Total Work Experience: {result.totalWork} year(s)
            </p>
            <p className="resumeTitle">
              Phone: {result.phoneNumber}
            </p>
            <p className="resumeTitle">
              Email: {result.email}
            </p>
            <p className="resumeTitle">
              Github: {result.github}
            </p>
            {result.portfolio && (
              <p className="resumeTitle">
                Portfolio: {result.portfolio}
              </p>)
            }
            
          </div>
          <div>
            <img
              src={result.image_url}
              alt={result.fullName}
              className="resumeImage"
            />
          </div>
        </header>
        <div className="resumeBody">
          <div>
            <h2 className="resumeBodyTitle">PROFILE SUMMARY</h2>
            <p
              dangerouslySetInnerHTML={{
                __html: replaceWithBr(result.objective),
              }}
              className="resumeBodyContent"
            />
          </div>
          <div>
            <h2 className="resumeBodyTitle">WORK HISTORY</h2>
            {result.workHistory.map((work) => (
              <p className="resumeBodyContent" key={work.name}>
                <span style={{ fontWeight: "bold" }}>{work.name}</span> -{" "}
                {work.position}{" "}{work.time}
              </p>
            ))}
          </div>
          <div>
            <h2 className="resumeBodyTitle">JOB PROFILE</h2>
            <p
              dangerouslySetInnerHTML={{
                __html: replaceWithBr(result.jobResponsibilities),
              }}
              className="resumeBodyContent"
            />
          </div>
          <div>
            <h2 className="resumeBodyTitle">JOB RESPONSIBILITIES</h2>
            <p
              dangerouslySetInnerHTML={{
                __html: replaceWithHyphen(result.keypoints),
              }}
              className="resumeBodyContent"
            />
          </div>
          <div>
          <h2 className="resumeBodyTitle">SKILLS</h2>
          <ul className="resumeBodyContent">
            {skills.map((skill, index) => (
              <li className="resumeSkills" key={index}>{skill.trim()}</li> // Ensure each skill is trimmed
            ))}
          </ul>
          </div>
        </div>
      </main>
    </>
  );
};

export default Resume;
