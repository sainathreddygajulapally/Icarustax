import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './TaxComfortPage.css';
import Header from './Header';

const TaxComfortPage = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const selectedOptions = state ? state.selectedOptions : {};

    const [requiredForms, setRequiredForms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null); // Track error state

    // Function to handle API call to OpenAI
    const fetchRequiredForms = async () => {
        setLoading(true);
        setError(null); // Reset error before new API call
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        { role: 'system', content: 'You are a helpful assistant that provides IRS tax form recommendations based on selected tax options.' },
                        { role: 'user', content: `Given the selected tax options: ${JSON.stringify(selectedOptions)}, which IRS tax forms are required? Please list the forms and a short description of each.` }
                    ],
                    max_tokens: 150,
                }),
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();
            if (data.choices && data.choices.length > 0) {
                const formsList = data.choices[0].message.content.split('\n').map(form => {
                    const [name, description] = form.split(':');
                    return { name: name?.trim(), description: description?.trim() };
                }).filter(form => form.name && form.description);
                setRequiredForms(formsList);
            } else {
                setError('No forms were returned from the API. Please try again later.');
            }
        } catch (error) {
            console.error('Error fetching required forms:', error);
            setError('Could not fetch forms. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleComfortableClick = async () => {
        await fetchRequiredForms();
    };

    const handleHelpClick = () => {
        navigate('/w2-upload');
    };

    return (
        <div className="tax-comfort-page">
            <Header />
            <div className="tax-comfort-container">
                <h2>How comfortable do you feel doing your own taxes?</h2>
                <p>We'll show our expert help options and make a recommendation.</p>

                <div className="comfort-options">
                    <div className="option-card" onClick={handleComfortableClick}>
                        <div className="icon" role="img" aria-label="person with laptop">👨‍💼</div>
                        <p>Comfortable on my own</p>
                    </div>
                    <div className="option-card" onClick={() => console.log("Selected: Prefer to hand off to an expert")}>
                        <div className="icon" role="img" aria-label="person with headset">👩‍💼</div>
                        <p>Want help when I need it</p>
                    </div>
                    <div className="option-card" onClick={handleHelpClick}>
                        <div className="icon" role="img" aria-label="person with briefcase">🧑‍💼</div>
                        <p>Prefer to hand off to an expert</p>
                    </div>
                </div>

                {loading ? (
                    <p>Loading required forms...</p>
                ) : error ? (
                    <p className="error">{error}</p>
                ) : (
                    requiredForms.length > 0 && (
                        <div className="forms-list">
                            <h3>Required Tax Forms</h3>
                            <ul>
                                {requiredForms.map((form, index) => (
                                    <li key={index}>
                                        <a href={`https://www.irs.gov/pub/irs-pdf/${form.name}.pdf`} target="_blank" rel="noopener noreferrer">
                                            {form.name}
                                        </a>
                                        <p>{form.description}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )
                )}

                <button className="back-button" onClick={() => navigate('/tax-filing')}>← Back</button>
            </div>
        </div>
    );
};

export default TaxComfortPage;
