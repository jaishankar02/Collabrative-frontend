import { useNavigate } from 'react-router';
import './styles/HomePage.css';
import { useState } from 'react'
import axios from 'axios';
// import { uuid } from 'uuidv4';
const HomePage = () => {
    const [userName, SetUserName] = useState('');
    const [roomDetails, setRoomDetails] = useState({ roomid: '', roompassword: '' });
    const [createFlag, setCreateFlag] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null); // For showing error messages
const [successMessage, setSuccessMessage] = useState(null); 
    const navigate=useNavigate();
    const handleJoinSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/join-room`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ roomId: roomDetails.roomid, password: roomDetails.roompassword, userName })
            });
            const data = await response.json();
            if (response.ok) {
                setSuccessMessage('Successfully joined the room!');
                navigate(`/editor/${roomDetails.roomid}`, { state: { userName,password:roomDetails.roompassword } });
            } else {
                setErrorMessage(data.message || 'Error joining the room');
            }
        } catch (error) {
            setErrorMessage('Failed to join room. Please try again.');
        }
    };
    
    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/create-room`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ roomId: roomDetails.roomid, password: roomDetails.roompassword, userName })
            });
            const data = await response.json();
            if (response.ok) {
                setSuccessMessage('Room created successfully!');
                navigate(`/editor/${roomDetails.roomid}`, { state: { userName,password:roomDetails.roompassword } });
            } else {
                setErrorMessage(data.message || 'Error creating the room');
            }
        } catch (error) {
            setErrorMessage('Failed to create room. Please try again.');
        }
    };
    const uuid = () => {
        return String(Date.now().toString(32) + Math.random().toString(16).replace(/\./g, "-"))
    }
    const HandleCreateRoom = (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (!createFlag) {
            setRoomDetails({ roomid: uuid(), roompassword: '' });
        }
        else
            setRoomDetails({ roomid: '', roompassword: '' });
        setCreateFlag(!createFlag);
    }
    return (
        <div className='HomePage'>
            <div className='JoinBox'>
                <p className="FormHeading">Connect and Collaborate in Real-Time</p>
                <div className="message-container">
    {errorMessage && <p className="error-message">{errorMessage}</p>}
    {successMessage && <p className="success-message">{successMessage}</p>}
</div>
                <form onSubmit={createFlag ? handleCreateSubmit : handleJoinSubmit}>

                    <div className="FormInputDiv">
                        <input id="UserName" type='text' className="FormInput" autoComplete="off" placeholder='' value={userName} onChange={(e) => { SetUserName(e.target.value) }} required />
                        <label className="FormLabel" htmlFor="UserName">Name</label>
                    </div>
                    <div className="FormInputDiv">
                        <input type='text' id='RoomId'
                            className="FormInput"
                            autoComplete='off' placeholder='' value={roomDetails.roomid} disabled={createFlag ? true : false} onChange={(e) => { setRoomDetails({ ...roomDetails, roomid: e.target.value }) }} required />
                        <label htmlFor="RoomId" className="FormLabel" >Room Id</label>
                    </div>
                    <div className="FormInputDiv">
                        <input id="Password" type='password' className="FormInput" autoComplete="off" placeholder='' value={roomDetails.roompassword} onChange={(e) => { setRoomDetails({ ...roomDetails, roompassword: e.target.value }) }} required />
                        <label className="FormLabel" htmlFor="Password">Password</label>
                    </div>
                    <div className="ButttonDiv">
                        <button type='submit'>{createFlag ? 'Create' : 'Join'}</button>
                    </div>

                </form>
                <p className="CreateMeetLink">Want to {createFlag ? 'Join' : 'Create New'}  Room? <a href='' onClick={HandleCreateRoom}>{createFlag ? "Join Room" : "New Room"}</a></p>
            </div>
        </div>
    )
}

export default HomePage