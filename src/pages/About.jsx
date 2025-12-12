import React, { useState, useEffect } from 'react';
import { contentService } from '../services/adminServices';
import { motion } from 'framer-motion';

const About = () => {
    const [content, setContent] = useState({ text: '', images: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const data = await contentService.getAbout();
                setContent(data || { text: '', images: [] });
            } catch (error) {
                console.error('Error fetching content:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, []);

    return (
        <div className="container mx-auto px-4 py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto text-center"
            >
                <h1 className="text-4xl font-bold text-[var(--color-secondary)] mb-8 font-heading">About Us</h1>
                {loading ? (
                    <div className="animate-pulse h-40 bg-gray-100 rounded-lg"></div>
                ) : (
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="prose prose-lg text-[var(--color-text-main)] text-left flex-1 order-2 md:order-1">
                            <p className="whitespace-pre-wrap">{content.text}</p>
                        </div>
                        {content.images && content.images.length > 0 && (
                            <div className="flex-1 order-1 md:order-2 w-full">
                                <div className="grid grid-cols-1 gap-4">
                                    {content.images.map((img, index) => (
                                        <div key={index} className="rounded-xl overflow-hidden shadow-sm h-64 md:h-80">
                                            <img src={img} alt={`About Us ${index + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default About;
