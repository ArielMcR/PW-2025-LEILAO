import { Routes, Route } from 'react-router';
import PageNotFound from '../PageNotFound/PageNotFound';

const AdminRoutes = () => {
    return (
        <Routes>
            <Route path="*" element={<PageNotFound />} />
        </Routes>
    );
};

export default AdminRoutes;



