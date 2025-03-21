import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { user, isAuthenticated } = useAuth();
    const [isConnected, setIsConnected] = useState(false);
    
    useEffect(() => {
        if (isAuthenticated && user) {
            // Initialize socket connection
            const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
                auth: {
                    token: localStorage.getItem('token')
                },
                query: {
                    userId: user.id,
                    userRole: user.role
                },
                transports: ['websocket'],
                autoConnect: true,
            });

            newSocket.on('connect', () => {
                console.log('Socket connected');
                setIsConnected(true);
            });

            newSocket.on('disconnect', () => {
                console.log('Socket disconnected');
                setIsConnected(false);
            });

            setSocket(newSocket);

            // Cleanup on unmount
            return () => {
                newSocket.close();
            };
        } else {
            // Close socket if user logs out
            if (socket) {
                socket.close();
                setSocket(null);
            }
        }
    }, [isAuthenticated, user]);

    // Join a telemedicine session
    const joinTelemedicineSession = (sessionId) => {
        if (socket) {
            socket.emit('joinTelemedicineSession', sessionId);
        }
    };

    // Leave a telemedicine session
    const leaveTelemedicineSession = (sessionId) => {
        if (socket) {
            socket.emit('leaveTelemedicineSession', sessionId);
        }
    };

    // Update staff schedule
    const updateSchedule = (scheduleData) => {
        if (socket) {
            socket.emit('scheduleUpdate', scheduleData);
        }
    };

    const value = {
        socket,
        isConnected,
        emit: (event, data) => socket?.emit(event, data),
        on: (event, callback) => socket?.on(event, callback),
        off: (event) => socket?.off(event),
        joinTelemedicineSession,
        leaveTelemedicineSession,
        updateSchedule
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};

export default SocketContext;