import React from 'react';
import '../Css/button.css'
import '../Css/EndSem.css'
const ExamTimetable = () => {
    const ESEUrl = "/ESE.pdf"
    const timetableData = [
        
        {
            program: "B.Tech (CS & E)",
            semester: "III",
            exams: [
                {
                    date: "Monday, 02/12/2024",
                    time: "10:00 To 12:30",
                    courseCode: "0701220301",
                    courseName: "Discrete Mathematics and Probability Theory (2021-25)"
                },
                {
                    date: "Monday, 02/12/2024",
                    time: "10:00 To 12:30",
                    courseCode: "0701220301",
                    courseName: "Discrete Mathematics and Graph Theory (2022-26, 2023-27)"
                },
                {
                    date: "Wednesday, 04/12/2024",
                    time: "10:00 To 11:30",
                    courseCode: "0701220305",
                    courseName: "Programming Paradigms (2020-24, 2021-25, 2022-26, 2023-27)"
                },
                {
                    date: "Friday, 06/12/2024",
                    time: "10:00 To 11:30",
                    courseCode: "0701220303",
                    courseName: "Fundamentals of Data Structures (2021-25)"
                },
                {
                    date: "Friday, 06/12/2024",
                    time: "10:00 To 11:30",
                    courseCode: "0701220303",
                    courseName: "Data Structures (2022-26, 2023-27)"
                },
                {
                    date: "Monday, 09/12/2024",
                    time: "10:00 To 11:30",
                    courseCode: "0701220307",
                    courseName: "Digital Electronics and Logic Design (2021-25)"
                },
                {
                    date: "Monday, 09/12/2024",
                    time: "10:00 To 11:30",
                    courseCode: "0701220307",
                    courseName: "Sensors and Microcontrollers (2022-26, 2023-27)"
                },
                {
                    date: "Wednesday, 11/12/2024",
                    time: "10:00 To 11:30",
                    courseCode: "0701220302",
                    courseName: "Computer Organization (2021-25, 2022-26, 2023-27)"
                }
            ]
        }
    ];

    return (
        <div class="ese"> 
            <h1 style={{ padding: '0.5rem', textAlign: 'center' }}><i>End Semester Examination 2024 Details</i></h1>
            <div class="data">
            <h3>Institute: (0701) Symbiosis Institute of Technology, Pune</h3>
            {timetableData.map((semesterData, index) => (
                <div key={index}>
                    <h4>Programme: {semesterData.program}</h4>
                    <h4>Semester: {semesterData.semester}</h4>
                    <table border="1" cellPadding="8" cellSpacing="0" style={{ width: '98%', marginBottom: '20px', position:"relative", left:"14px" }}>
                        <thead>
                            <tr>
                                <th>Day/Date</th>
                                <th>Time</th>
                                <th>Course Code</th>
                                <th>Course Name</th>
                            </tr>
                        </thead>
                        <tbody>
                            {semesterData.exams.map((exam, idx) => (
                                <tr key={idx}>
                                    <td>{exam.date}</td>
                                    <td>{exam.time}</td>
                                    <td>{exam.courseCode}</td>
                                    <td>{exam.courseName}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ))}
            </div>
            <div className='button-container'>
            <h2>Download the file</h2>
            <h4>SIT, Student Instructions for Examination</h4>
            <a href={ESEUrl} download className='button1'>
                Download
            </a>
            </div>
        </div>
    );
};

export default ExamTimetable;
