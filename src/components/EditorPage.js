import React, { useEffect, useRef, useState } from 'react'
import Client from './Client';
import Editor from './Editor';
import './styles/EditorPage.css';
import { initSocket } from '../socket';
import ACTIONS from '../Action';
import {useLocation,useNavigate,Navigate,useParams} from 'react-router-dom'
const EditorPage = () => {
    const socketRef=useRef(null);
    const codeRef=useRef(null);
    const location= useLocation();
    const {roomId}=useParams();
    const reactNavigator=useNavigate();
    const [clients,setClients]=useState([]);
    useEffect(()=>{
        const init = async()=>{
            socketRef.current=await initSocket();
            socketRef.current.on('connect_error',(err)=>handleErrors(err));
            socketRef.current.on('connect_failed',(err)=>handleErrors(err));
            function handleErrors(e){
                console.log("socket err",e);
                reactNavigator('/');
            }
            socketRef.current.emit(ACTIONS.JOIN,{
                roomId,
                username:location.state?.userName,
                password:location.state?.password
            })

            socketRef.current.on(ACTIONS.JOINED,({clients,username,socketId})=>{
                if(username!==location.state.userName){
                    console.log(`${username} joined the room.`);
                }
                setClients(clients);
                socketRef.current.emit(ACTIONS.SYNC_CODE,{
                    code:codeRef.current,
                    socketId,
                })
            })

            socketRef.current.on(ACTIONS.DISCONNECTED,({socketId,username})=>{
                console.log(`${username} left the room`)
                setClients((prev)=>{
                    return prev.filter((client)=>client.socketId!==socketId)
                })
            })
        }
        init();

        return ()=>{
            socketRef.current.off(ACTIONS.JOIN);
            socketRef.current.off(ACTIONS.DISCONNECTED);
            socketRef.current.disconnect();
        }

    },[])
    
    if(!location.state){
        return <Navigate to="/"/>
    }

    const copyToClipboard = () => {
        navigator.clipboard.writeText(roomId)
            .then(() => {
                alert("RoomID copied to clipboard!");
            })
            .catch((error) => {
                console.error("Failed to copy RoomID: ", error);
            });
    };

    const leaveRoom = () => {
        socketRef.current.emit(ACTIONS.LEAVE, { roomId, username: location.state.userName });
        socketRef.current.disconnect();
        reactNavigator('/');
    };

  return (
    <div className='mainWrap'>
        <div className='aside'>
            <div className='asideInner'>
                <h3>Members</h3>
                <div className='clientsList'>
                    {
                        clients.map((client)=><Client key={client.socketId} username={client.username}/>)
                    }
                </div>
            </div>
            <button className='btn copyBtn' onClick={copyToClipboard}>Copy RoomID</button>
            <button className='btn leaveBtn' onClick={leaveRoom}>Leave Button</button>
        </div>
        <div className='editorWrap'>
            <Editor socketRef={socketRef} roomId={roomId} onCodeChange={(code)=>{codeRef.current=code;}} username={location.state?.userName} />
        </div>
    </div>
  )
}

export default EditorPage