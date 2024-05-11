import React, { useState, useEffect, useContext } from "react";
import { useLocation } from "react-router-dom";
import { DropdownButton, Dropdown, Button } from "react-bootstrap";
import { FaUserCircle } from "react-icons/fa";
import Card from "react-bootstrap/Card";

import { MDBCol, MDBContainer, MDBRow, MDBCard, MDBCardText, MDBCardBody, MDBCardImage, MDBListGroup, MDBListGroupItem, MDBBtn, MDBTypography } from "mdb-react-ui-kit";
import UserContext from "../UserContext";
import { useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faChartColumn, faAddressCard, faPlus, faCar, faUser, faCoins, faFileInvoiceDollar } from "@fortawesome/free-solid-svg-icons";
import { auth, db } from "../config/firebase";
import { updateDoc, doc, getDoc } from "firebase/firestore";
import { storage } from "../config/firebase";
import { ref, uploadBytes, getDownloadURL, listAll, list } from "firebase/storage";
import { v4 } from "uuid";


export default function EditButton() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useContext(UserContext);
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(user.managementName || "");
    const [managementName, setManagementName] = useState(user.managementName || "");
    const [address, setAddress] = useState(user.companyAddress || "");
    const [companyContact, setCompanyContact] = useState(user.contact || "");
    const [companyEmail, setCompanyEmail] = useState(user.email || "");
    const [companyName, setCompanyName] = useState(user.management || "");
    const [profileImageUrl, setProfileImageUrl] = useState("");

    const userDocRef = auth.currentUser ? doc(db, "establishments", auth.currentUser.uid) : null;
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
    const handleButtonClick = () => {
        navigate("/TicketInfo");
    };

    const handleViewProfile = () => {
        navigate("/Profiles");
    };

    const handleAgentSchedule = () => {
        navigate("/AgentSchedule");
    };

    const handleRevenues = () => {
        navigate("/Tracks");
    };

    const handleRegister = () => {
        navigate("/AgentRegistration");
    };

    const handleFeed = () => {
        navigate("/Feedback");
    };

    const handleProfile = () => {
        navigate("/Profiles");
    };
    const customListItemStyle = {
        border: "none", // Remove border from list items
        backgroundColor: "#FFFFFF",
    };

    const [imageUpload, setImageUpload] = useState(null);
    const [imageUrls, setImageUrls] = useState([]);
    const [currentImageUrl, setCurrentImageUrl] = useState("");

    const saveProfileImageUrl = async (url) => {
        if (userDocRef) {
            await updateDoc(userDocRef, {
                profileImageUrl: url,
            });
        }
    };

    useEffect(() => {
        if (userDocRef) {
            const fetchImageUrl = async () => {
                const docSnap = await getDoc(userDocRef);
                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    setProfileImageUrl(userData.profileImageUrl);
                } else {
                    console.log("No such document!");
                }
            };

            fetchImageUrl().catch(console.error);
        }
    }, [userDocRef]);
    const handlelogin = () => {
        navigate("/");
    };
    const listItemHoverStyle = {
        backgroundColor: "#003851",
    };
    const imagesListRef = ref(storage, "images/");
    const uploadFile = () => {
        if (imageUpload && auth.currentUser) {
            const imageRef = ref(storage, `images/${imageUpload.name + v4()}`);
            uploadBytes(imageRef, imageUpload).then((snapshot) => {
                getDownloadURL(snapshot.ref).then((url) => {
                    setProfileImageUrl(url);
                    saveProfileImageUrl(url);
                });
            });
        }
    };

    useEffect(() => {
        listAll(imagesListRef).then((response) => {
            response.items.forEach((item) => {
                getDownloadURL(item).then((url) => {
                    setImageUrls((prev) => [...prev, url]);
                });
            });
        });
    }, []);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                if (auth.currentUser) {
                    const userId = auth.currentUser.uid;
                    const currentUserManagementName = user.managementName;

                    const doc = await db.collection("establishments").doc(userId).get();

                    if (doc.exists) {
                        const userData = doc.data();

                        setName(userData.managementName || "");
                        setAddress(userData.address || "");
                        setCompanyContact(userData.contact || "");
                        setCompanyName(userData.managementName || "");
                        setCompanyEmail(userData.email || "");
                    } else {
                        console.log("No user data found!");
                    }
                }
            } catch (error) {
                console.error("Error fetching user data: ", error);
            }
        };

        fetchUserData();
    }, []);

    const updateUserData = async () => {
        try {
            if (auth.currentUser) {
                const userId = auth.currentUser.uid;
                const userDocRef = doc(db, "establishments", userId);

                const updatedData = {
                    managementName: name,
                    address: address,
                    contact: companyContact,
                    email: companyEmail,
                };

                await updateDoc(userDocRef, updatedData);

                console.log("User data updated/created successfully!");
            } else {
                console.error("User not authenticated");
            }
        } catch (error) {
            console.error("Error updating user data: ", error);
        }
    };

    const toggleEditing = () => {
        setIsEditing(!isEditing);
    };

    const handleSaveProfile = () => {
        console.log(auth.currentUser);
        setIsEditing(false);
        updateUserData();
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
    const imageSizeStyles = {
        width: "100%",
        height: "200px", // Set the desired height for all images
        objectFit: "cover",
        borderRadius: "10px", // Set the desired border radius
    };

    return (
        <section style={{ backgroundSize: "cover", backgroundRepeat: "no-repeat", minHeight: "100vh", backgroundColor: "white" }}>
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

<MDBContainer className="py-5" style={{ backgroundColor: "#f9f9f9" , marginTop: '10vh'}}>
    <MDBRow className="justify-content-center">
        <MDBCol md="8">
            <MDBCard className="shadow">
                <MDBCardBody>
                    <div className="text-center mb-4">
                        <MDBCardImage src={profileImageUrl || "defaultt.png"} alt="Profile" className="img-thumbnail" style={{ width: "150px", borderRadius: "50%" }} />
                    </div>
                    {isEditing ? (
                        <>
                            <div className="mb-3">
                                <input type="file" className="form-control" id="file-upload" onChange={(event) => setImageUpload(event.target.files[0])} style={{ display: "none" }} />
                                <label htmlFor="file-upload">
                                    <MDBBtn outline color="dark" className="mb-3" style={{ overflow: "visible" }} component="span">
                                        Upload Image
                                    </MDBBtn>
                                </label>
                            </div>
                            <div className="mb-3">
                                <input type="text" className="form-control" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
                            </div>
                            <div className="mb-3">
                                <input type="text" className="form-control" placeholder="Location" value={address} onChange={(e) => setAddress(e.target.value)} />
                            </div>
                            <div className="mb-3">
                                <input type="email" className="form-control" placeholder="Email" value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} />
                            </div>
                            <div className="mb-3">
                                <input type="tel" className="form-control" placeholder="Contact Number" value={companyContact} onChange={(e) => setCompanyContact(e.target.value)} />
                            </div>
                            <MDBBtn color="primary" className="me-2" onClick={handleSaveProfile}>
                                Save Changes
                            </MDBBtn>
                            <MDBBtn color="danger" onClick={toggleEditing}>
                                Cancel
                            </MDBBtn>
                        </>
                    ) : (
                        <>
                            <h4 className="card-title mb-4">{name}</h4>
                            <p className="card-text mb-1">Location: {address}</p>
                            <p className="card-text mb-1">Email: {companyEmail}</p>
                            <p className="card-text mb-1">Contact Number: {companyContact}</p>
                            <MDBBtn color="dark" className="mb-3" onClick={toggleEditing}>
                                Edit Profile
                            </MDBBtn>
                        </>
                    )}
                </MDBCardBody>
            </MDBCard>
        </MDBCol>
        <MDBCol lg="4" style={{marginTop: '-5vh'}}>
            <div className="row mt-5">
                <h1 style={{ color: "black", fontSize: "30px" }}> Company Parking Lot </h1>
            </div>
            <hr style={{ marginTop: "30px", marginBottom: "35px", border: "none" }} />

            <MDBRow className="g-2">
    <MDBCol className="mb-2">
        <MDBCardImage src="https://static-ph.lamudi.com/static/media/bm9uZS9ub25l/2x2x2x380x244/7e83cd57260dee.jpg" alt="image 1" style={{ width: "100%", height: "auto", borderRadius: "10px", animation: "fadeIn 1s ease-in-out", transition: "transform 0.3s ease", ":hover": { transform: "scale(1.05)" } }} />
    </MDBCol>
    <MDBCol className="mb-2">
        <MDBCardImage src="https://static-ph.lamudi.com/static/media/bm9uZS9ub25l/2x2x5x880x396/54e6e09d3e6e1a.jpg" alt="image 1" style={{ width: "100%", height: "auto", borderRadius: "10px", animation: "fadeIn 1s ease-in-out", transition: "transform 0.3s ease", ":hover": { transform: "scale(1.05)" } }} />
    </MDBCol>
</MDBRow>
<MDBRow className="g-2">
    <MDBCol className="mb-2">
        <MDBCardImage src="https://www.apartmentguide.com/blog/wp-content/uploads/2019/10/parking_garage_HERO.jpg" alt="image 1" style={{ width: "100%", height: "auto", borderRadius: "10px", animation: "fadeIn 1s ease-in-out", transition: "transform 0.3s ease", ":hover": { transform: "scale(1.05)" } }} />
    </MDBCol>
    <MDBCol className="mb-2">
        <MDBCardImage src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_pn4I4ZoKpjQEPxu-qmz_Db7y-jZrbNLFdAWdsG3-GUcCw-XW9SESLsm-VkkNBLy7KFI&usqp=CAU" alt="image 1" style={{ width: "100%", height: "100%", borderRadius: "10px", animation: "fadeIn 1s ease-in-out", transition: "transform 0.3s ease", ":hover": { transform: "scale(1.05)" } }} />
    </MDBCol>
</MDBRow>
        </MDBCol>
    </MDBRow>
</MDBContainer>;
            </div>
        </section>
    );
}
