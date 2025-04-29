// server.js - Main entry point
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcryptjs');
const app = express();
const excel = require('exceljs');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); // Serve static files from 'public' directory

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/hmsDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('Connected to MongoDB...'))
    .catch(err => console.error('Could not connect to MongoDB...', err));

// User Schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50
    },
    email: {
        type: String,
        required: true,
        unique: true,
        minlength: 5,
        maxlength: 255
    },
    password: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 1024
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('User', userSchema);
// Add these schemas after the existing User schema

const reservationSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    country: String,
    roomType: String,
    numRooms: Number,
    numGuests: Number,
    checkIn: Date,
    checkOut: Date,
    totalBill: Number,
    meals: [String],
    status: {
        type: String,
        default: 'Pending'
    }
});

const paymentSchema = new mongoose.Schema({
    reservationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reservation'
    },
    amount: Number,
    serviceTax: Number,
    gstTax: Number,
    totalAmount: Number,
    paymentMode: String,
    status: {
        type: String,
        default: 'Completed'
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const Reservation = mongoose.model('Reservation', reservationSchema);
const Payment = mongoose.model('Payment', paymentSchema);

const staffSchema = new mongoose.Schema({
    staffId: {
        type: String,
        required: true,
        unique: true
    },
    name: String,
    position: String,
    department: String,
    email: String,
    phone: String,
    joiningDate: Date,
    salary: Number,
    status: String,
    address: String,
    attendance: [{
        date: Date,
        status: String,
        entryTime: String
    }]
});

const Staff = mongoose.model('Staff', staffSchema);

const roomAvailabilitySchema = new mongoose.Schema({
    roomType: {
        type: String,
        required: true,
        unique: true
    },
    isAvailable: {
        type: Boolean,
        default: true
    }
});

const RoomAvailability = mongoose.model('RoomAvailability', roomAvailabilitySchema);


// Routes
app.use(express.static(__dirname));
// Serve signup page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'signup.html'));
});

// Serve register page
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'register.html'));
});

// Serve main page
app.get('/main', (req, res) => {
    res.sendFile(path.join(__dirname, 'mainpage.html'));
});

// Login route
app.post('/login', async (req, res) => {
    try {
        // Check if user exists
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(400).json({ message: 'User not registered. Please register first.' });
        }

        // Validate password
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid email or password.' });
        }

        res.json({ success: true, message: 'Login successful' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Register route
app.post('/register', async (req, res) => {
    try {
        // Check if user already exists
        let user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(400).json({ message: 'User already registered.' });
        }

        // Create new user
        user = new User({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
        });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);

        // Save user to database
        await user.save();

        res.json({ success: true, message: 'Registration successful' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Add these routes after existing routes

app.post('/api/reservations', async (req, res) => {
    try {
        const reservation = new Reservation(req.body);
        await reservation.save();
        res.json({ success: true, reservationId: reservation._id });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error creating reservation' });
    }
});

app.post('/api/payments', async (req, res) => {
    try {
        const payment = new Payment(req.body);
        await payment.save();

        // Update reservation status
        await Reservation.findByIdAndUpdate(req.body.reservationId, { status: 'Confirmed' });

        res.json({ success: true, paymentId: payment._id });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error processing payment' });
    }
});

app.get('/api/reservations', async (req, res) => {
    try {
        const reservations = await Reservation.find();
        res.json(reservations);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reservations' });
    }
});

app.delete('/api/reservations/:id', async (req, res) => {
    try {
        const result = await Reservation.findByIdAndDelete(req.params.id);
        if (!result) {
            return res.status(404).json({ message: 'Reservation not found' });
        }
        res.json({ success: true, message: 'Reservation deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting reservation' });
    }
});

// Get single reservation by ID
app.get('/api/reservations/:id', async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id);
        if (!reservation) {
            return res.status(404).json({ message: 'Reservation not found' });
        }
        res.json(reservation);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reservation details' });
    }
});

// Add this route to handle reservation status updates
app.patch('/api/reservations/:id', async (req, res) => {
    try {
        const reservation = await Reservation.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        );

        if (!reservation) {
            return res.status(404).json({ message: 'Reservation not found' });
        }

        res.json(reservation);
    } catch (error) {
        res.status(500).json({ message: 'Error updating reservation status' });
    }
});

// Add this route to serve confirm.html
app.get('/confirm.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'confirm.html'));
});

// Update reservation route
app.put('/api/reservations/:id', async (req, res) => {
    try {
        const reservation = await Reservation.findByIdAndUpdate(
            req.params.id,
            {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                phone: req.body.phone,
                country: req.body.country,
                roomType: req.body.roomType,
                numRooms: req.body.numRooms,
                meals: req.body.meals,
                checkIn: req.body.checkIn,
                checkOut: req.body.checkOut
            },
            { new: true }
        );

        if (!reservation) {
            return res.status(404).json({ message: 'Reservation not found' });
        }

        res.json(reservation);
    } catch (error) {
        res.status(500).json({ message: 'Error updating reservation' });
    }
});

// Add these routes for staff functionality
app.post('/api/staff/verify', async (req, res) => {
    try {
        const staff = await Staff.findOne({ staffId: req.body.staffId });
        if (!staff) {
            return res.status(404).json({ success: false, message: 'Staff ID not found' });
        }
        res.json({ success: true, staff });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.post('/api/staff/attendance', async (req, res) => {
    try {
        const staff = await Staff.findOne({ staffId: req.body.staffId });
        if (!staff) {
            return res.status(404).json({ success: false, message: 'Staff ID not found' });
        }

        staff.attendance.push({
            date: new Date(),
            status: req.body.status,
            entryTime: req.body.entryTime || null
        });

        await staff.save();
        res.json({ success: true, message: 'Attendance recorded successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.get('/api/export-reservations', async (req, res) => {
    try {
        const reservations = await Reservation.find();

        const workbook = new excel.Workbook();
        const worksheet = workbook.addWorksheet('Reservations');

        worksheet.columns = [
            { header: 'Booking ID', key: '_id', width: 25 },
            { header: 'Name', key: 'name', width: 20 },
            { header: 'Email', key: 'email', width: 25 },
            { header: 'Phone', key: 'phone', width: 15 },
            { header: 'Country', key: 'country', width: 15 },
            { header: 'Room Type', key: 'roomType', width: 15 },
            { header: 'Number of Rooms', key: 'numRooms', width: 15 },
            { header: 'Check In', key: 'checkIn', width: 15 },
            { header: 'Check Out', key: 'checkOut', width: 15 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Total Bill', key: 'totalBill', width: 15 }
        ];

        reservations.forEach(reservation => {
            worksheet.addRow({
                _id: reservation._id,
                name: `${reservation.firstName} ${reservation.lastName}`,
                email: reservation.email,
                phone: reservation.phone,
                country: reservation.country,
                roomType: reservation.roomType,
                numRooms: reservation.numRooms,
                checkIn: new Date(reservation.checkIn).toLocaleDateString(),
                checkOut: new Date(reservation.checkOut).toLocaleDateString(),
                status: reservation.status,
                totalBill: `Rs. ${(reservation.totalBill * 1000000).toFixed(2)}/-`
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=Reservations.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        res.status(500).json({ message: 'Error exporting reservations' });
    }
});

// Add API endpoints for room availability
app.get('/api/room-availability', async (req, res) => {
    try {
        const availableRooms = await RoomAvailability.find();
        res.json(availableRooms);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching room availability' });
    }
});

app.post('/api/room-availability/toggle', async (req, res) => {
    try {
        const { roomType, isAvailable } = req.body;
        const result = await RoomAvailability.findOneAndUpdate(
            { roomType },
            { isAvailable },
            { upsert: true, new: true }
        );
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error updating room availability' });
    }
});

app.get('/api/dashboard-stats', async (req, res) => {
    try {
        const reservations = await Reservation.find();

        // Calculate total booked rooms
        const totalBookedRooms = reservations.reduce((total, reservation) => {
            return total + reservation.numRooms;
        }, 0);

        // Calculate total revenue directly from totalBill
        const totalRevenue = reservations.reduce((total, reservation) => {
            return total + (reservation.totalBill * 1000000);
        }, 0);

        res.json({
            totalBookedRooms,
            totalRevenue
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching dashboard stats' });
    }
});

// Staff management routes
app.post('/api/staff', async (req, res) => {
    try {
        const staff = new Staff(req.body);
        await staff.save();

        // Transform the response to match frontend expectations
        const responseStaff = {
            _id: staff._id,
            staffId: staff.staffId,
            name: staff.name,
            position: staff.position,
            department: staff.department,
            email: staff.email,
            phone: staff.phone,
            joiningDate: staff.joiningDate,
            salary: staff.salary,
            status: staff.status,
            address: staff.address
        };
        res.json({ success: true, staff });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error adding staff member' });
    }
});

app.get('/api/staff', async (req, res) => {
    try {
        const staffMembers = await Staff.find();
        res.json(staffMembers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching staff members' });
    }
});

app.put('/api/staff/:id', async (req, res) => {
    try {
        const updatedStaff = await Staff.findByIdAndUpdate(
            req.params.id,
            {
                empId: req.body.empId,
                name: req.body.name,
                designation: req.body.designation,
                department: req.body.department,
                email: req.body.email,
                phone: req.body.phone,
                joiningDate: req.body.joiningDate,
                salary: req.body.salary,
                status: req.body.status,
                address: req.body.address
            },
            { new: true }
        );
        res.json({ success: true, staff: updatedStaff });
    } catch (error) {
        res.status(500).json({ message: 'Error updating staff member' });
    }
});

app.delete('/api/staff/:id', async (req, res) => {
    try {
        const deletedStaff = await Staff.findByIdAndDelete(req.params.id);

        if (!deletedStaff) {
            return res.status(404).json({
                success: false,
                message: 'Staff member not found'
            });
        }

        res.json({
            success: true,
            message: 'Staff member deleted successfully',
            deletedStaff
        });
    } catch (error) {
        console.error('Delete staff error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting staff member'
        });
    }
});

// Start server
const port = process.env.PORT || 5502;
app.listen(port, () => console.log(`Server running on port ${port}...`));