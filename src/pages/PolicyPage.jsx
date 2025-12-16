import React, { useEffect, useState } from 'react';
import { policyService } from '../services/adminServices';
import { useParams } from 'react-router-dom';

const PolicyPage = ({ type, title }) => {
    const [content, setContent] = useState('<p>Loading...</p>');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPolicy = async () => {
            setLoading(true);
            try {
                const data = await policyService.getPolicy(type);
                setContent(data || '<p>No policy content available.</p>');
            } catch (error) {
                console.error("Error fetching policy:", error);
                setContent('<p>Error loading policy.</p>');
            } finally {
                setLoading(false);
            }
        };

        fetchPolicy();
    }, [type]);

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl font-heading font-bold text-[var(--color-primary)] mb-8 text-center">
                {title}
            </h1>
            <div
                className="prose prose-lg mx-auto bg-white p-8 rounded-lg shadow-md"
                dangerouslySetInnerHTML={{ __html: content }}
            />
        </div>
    );
};

export default PolicyPage;
