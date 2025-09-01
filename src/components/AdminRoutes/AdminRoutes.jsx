import { Routes, Route } from 'react-router';
import PageNotFound from '../PageNotFound/PageNotFound';
import Categories from '../../pages/private/Categories/index';
import Feedback from '../../pages/private/Feedback/index';

const AdminRoutes = () => {
    return (
        <Routes>
            <Route path="/Categories" element={<Categories />} />
            <Route path="/Feedback" element={<Feedback />} />
            <Route path="*" element={<PageNotFound />} />
        </Routes>
    );
};

export default AdminRoutes;



