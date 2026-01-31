// Simple script to set JWT token in localStorage
// Run this in browser console on your Stocks app

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo0LCJlbWFpbCI6InJhaHVsQGV4YW1wbGUuY29tIiwicm9sZSI6InVzZXIiLCJleHAiOjE3Njk5NjE5OTJ9.5dPJ6q4vc4klwrrRxdykXfm5V3lWrOT6CYsklZ63LB8";

localStorage.setItem('auth_token', token);
console.log('JWT token set! Refresh the page to test.');
console.log('Token:', token);

// To verify it's set
console.log('Stored token:', localStorage.getItem('auth_token'));
