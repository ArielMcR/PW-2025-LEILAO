import { Routes, Route } from 'react-router';
import PageNotFound from '../PageNotFound/PageNotFound';
import Dashboard from '../../pages/private/Dashboard/index';
import Users from '../../pages/private/Users/index';
import Auctions from '../../pages/private/Auctions/index';
import Categories from '../../pages/private/Categories/index';
import Feedback from '../../pages/private/Feedback/index';

const AdminRoutes = () => {
    return (
        <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/auctions" element={<Auctions />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="*" element={<PageNotFound />} />
        </Routes>
    );
};

export default AdminRoutes;



