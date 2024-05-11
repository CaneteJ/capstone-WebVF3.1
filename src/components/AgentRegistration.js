import React, { useState, useContext } from "react";
import { db, auth } from "../config/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, collection, doc, getDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import { DropdownButton, Dropdown, Button } from "react-bootstrap";
import { FaUserCircle } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import UserContext from "../UserContext";
import { MDBCol, MDBContainer, MDBRow, MDBCard, MDBCardText, MDBCardBody, MDBCardImage, MDBListGroup, MDBListGroupItem, MDBBtn, MDBTypography } from "mdb-react-ui-kit";
import './dashboardCard.css'

function CreateAccount() {
    const location = useLocation();
    const { user } = useContext(UserContext);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [address, setAddress] = useState("");
    const [companyAddress, setCompanyAddress] = useState(user.companyAddress);
    const [managementName, setManagementName] = useState(user.managementName);
    const [companyContact, setCompanyContact] = useState(user.contact);
    const [selectedRadioOption, setSelectedRadioOption] = useState("");
    const [profileImageUrl, setProfileImageUrl] = useState("");
    const listItemStyle = {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 15px",
        transition: "background-color 0.3s ease",
        cursor: "pointer",
        backgroundColor: "#FFFFFF",
        border: "none",
        boxShadow: "none",
    };
    const styles = {
        welcomeMessage: {
            position: "absolute",
            top: "10px",
            right: "10px",
            margin: "0",
            color: "#fff",
            fontFamily: "Rockwell, sans-serif",
            textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
        },
        icon: {
            marginRight: "5px",
        },
    };
    const handlelogin = () => {
        navigate("/");
    };
    const handleFeed = () => {
        navigate("/Feedback");
    };
    const handleViewProfile = () => {
        navigate("/Profiles");
    };
    const handleRevenues = () => {
        navigate("/Tracks");
    };
    const handleButtonClick = () => {
        navigate("/TicketInfo");
    };
    const handleRegister = () => {
        navigate("/AgentRegistration");
    };
    const handleAgentSchedule = () => {
        navigate("/AgentSchedule");
    };
    const listItemHoverStyle = {
        backgroundColor: "#003851",
    };
    const customListItemStyle = {
        border: "none", // Remove border from list items
        backgroundColor: "#FFFFFF",
    };
    const navigate = useNavigate();
    const collectionRef = collection(db, "agents");

    const handleBack = () => {
        navigate("/Dashboard");
    };
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await setDoc(doc(db, "agents", user.uid), {
                uid: user.uid,
                firstName,
                lastName,
                email,
                phoneNumber,
                address,
                password,
                managementName,
                companyAddress,
                companyContact,
                selectedRadioOption,
            });

            console.log("Document successfully written and user registered!");
            setFirstName("");
            setLastName("");
            setEmail("");
            setPassword("");
            setPhoneNumber("");
            setAddress("");
            setSelectedRadioOption("");

            alert("Successfully registered!");
            navigate("/Dashboard");
        } catch (error) {
            console.error("Error creating account:", error);
            alert(error.message);
        }
    };

    const handleRadioChange = (e) => {
        setSelectedRadioOption(e.target.value);
    };

    const containerStyle = {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: "100vh",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundColor: "white",
    };

    const formContainerStyle = {
        backdropFilter: "blur(3px)",
        backgroundColor: "white",
        padding: "30px",
        borderRadius: "10px",
        boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.2)",
        width: "400px",
        marginTop: "50px",
    };

    const inputGroupStyle = {
        marginBottom: "15px",
        marginRight: "10px",
        marginTop: "10px",
    };

    const inputStyle = {
        width: "100%",
        padding: "10px",
        marginBottom: "15px",
        border: "1px solid #ccc",
        borderRadius: "5px",
        fontSize: "16px",
        fontFamily: "Georgina",
    };

    const buttonStyle = {
        width: "100%",
        padding: "12px",
        backgroundColor: "rgba(4, 55,55, 0.7)",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        fontSize: "18px",
    };

    return (
        
        <section>
 <div className="admin-dashboard"> {/* Adjusted marginTop to account for navbar */}
        <div className="sidebar">
            <div className="admin-container">
            </div>
            <div class="wrapper">
                <div class="side">
                    <div>
                                {profileImageUrl ? <MDBCardImage src={profileImageUrl} alt="Operator Profile Logo" className="rounded-circle" style={{ width: "70px"}} fluid /> : <MDBCardImage src="default_placeholder.jpg" alt="Default Profile Logo" className="rounded-circle" style={{ width: "70px", marginTop: '-6vh' }} fluid />}
                                <p style={{ fontFamily: "Georgina", fontSize: "20px", border: "white", fontWeight: "bold", colo: 'white'}}>Administrator</p>
                                <p style={{ fontFamily: "Georgina", color: "white", fontWeight: "bold", fontSize: 12, marginTop: -15}}>
                                    {managementName}                 
                                </p>
                                </div>            
                    <h2>Menu</h2>
                    <ul>
                        <li><a href="Dashboard"><i class="fas fa-home"></i>Home</a></li>
                        <li><a href='AgentRegistration'><i class="fas fa-user"></i>Account Management</a></li>
                        <li><a href='TicketInfo'><i class="fas fa-address-card"></i>Ticket Management</a></li>
                        <li><a href='Tracks'><i class="fas fa-project-diagram"></i>Management Details</a></li>
                        <li><a href="AgentSchedule"><i class="fas fa-blog"></i>Schedule Management</a></li>
                        <li><a href="Profiles"><i class="fas fa-blog"></i>Profile</a></li>
                        <li><a href="Feedback"><i class="fas fa-blog"></i>Feedback</a></li>
                        <li><a href="/"><i className="fas fa-sign-out-alt" style={{ color: 'red' }}></i>Logout</a></li>
                    </ul>

                    
                </div>
                
            </div>
            <nav className="navbar navbar-expand-lg navbar-dark" style={{ backgroundColor: '#132B4B', position: "fixed", width: "500vh", marginLeft: '-150vh',height: '15%', marginTop: '-8%'}}>
<div className="container">
    <Link className="navbar-brand" to="/Dashboard" style={{ fontSize: "25px"}}>
    </Link>
</div>
</nav>
</div>
   
            <MDBContainer className="py-4" style={{margin: 'auto', justifyContent: 'center', alignContent: 'center', marginRight: '-10%'}}>
                <MDBRow>
                  
   
                    <MDBCol lg="8">
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '35px', marginLeft: '150px' }}>
                        <MDBCard style={{backgroundColor: "rgba(19, 43, 75, 0.7)", minHeight: "50vh", width: '100vh', justifyContent: 'center', alignItems: 'center'}}>
                            <MDBCardBody >
                                <h4 style={{ textAlign: "center", fontSize: "25px", color: "white" , fontWeight: "bold"}}>Create Operator Account</h4>
                                <form onSubmit={handleSubmit}>
                                    <div style={{width: '70vh'}}>
                                    <div style={inputGroupStyle} >
                                        <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required style={inputStyle} />
                                    </div>
                                    <div style={inputGroupStyle}>
                                        <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required style={inputStyle} />
                                    </div>
                                    <div style={inputGroupStyle}>
                                        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
                                    </div>
                                    <div style={inputGroupStyle}>
                                        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} />
                                    </div>
                                    <div style={inputGroupStyle}>
                                        <input type="text" placeholder="Phone Number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required style={inputStyle} />
                                    </div>
                                    <div style={inputGroupStyle}>
                                        <input type="text" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} required style={inputStyle} />
                                    </div>
                                    <div style={inputGroupStyle}>
                                        <label style={{ marginRight: "20px", color: "white",fontStyle: 'bold', fontSize: "18px"}}>
                                            <input type="radio" value="Male" checked={selectedRadioOption === "Male"} onChange={handleRadioChange} /> Male
                                        </label>
                                        <label style={{color: "white" , fontSize: "18px", fontStyle: 'bold'}}>
                                            <input type="radio" value="Female" checked={selectedRadioOption === "Female"} onChange={handleRadioChange} /> Female
                                        </label>
                                    </div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    <button type="submit" style={{ backgroundColor: "#39FF14", border: 'none', borderRadius: 10, width: '30vh', alignSelf: 'center', color: 'white', fontSize: 'bold', height: '5vh'}}>
                                        Register
                                    </button>
                                    </div>
                                </form>
                            </MDBCardBody>
                            
                        </MDBCard>
                        </div>
                    </MDBCol>
                </MDBRow>
            </MDBContainer>
            </div>
            
         
        </section>
    );
}

export default CreateAccount;