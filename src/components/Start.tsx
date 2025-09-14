import { useState } from 'react';
import { FlowerAPI } from '../services/api';

interface StartProps {
  onStart: () => void;
}

export default function Start({ onStart }: StartProps) {
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState('');

  const handleSeedData = async () => {
    setIsSeeding(true);
    setSeedMessage('Seeding data...');
    try {
      const response = await fetch('/data/mock-flowers.json');
      if (!response.ok) {
        throw new Error(`Failed to fetch mock data: ${response.statusText}`);
      }
      const flowers = await response.json();
      let successCount = 0;
      const errorMessages: string[] = [];

      for (const flower of flowers) {
        try {
          await FlowerAPI.createFlower(flower);
          successCount++;
        } catch (error: any) {
          const errorMessage = `Failed to create flower "${flower.name}": ${error.message}`;
          console.error(errorMessage);
          errorMessages.push(errorMessage);
        }
      }

      let finalMessage = `${successCount} of ${flowers.length} flowers seeded successfully.`;
      if (errorMessages.length > 0) {
        // Using <br> for line breaks in HTML
        setSeedMessage(<> {finalMessage} <br/> Errors: <br/> {errorMessages.join('<br/>')} </>);
      } else {
        setSeedMessage(finalMessage);
      }

    } catch (error: any) {
      console.error('Failed to seed data:', error);
      setSeedMessage(`Failed to seed data: ${error.message}`);
    }
    setIsSeeding(false);
  };

  return (
    <div className="start-page">
      <h1 className="start-title">Planty</h1>
      <p className="start-subtitle">Plant your memories, Warp to your friends.</p>
      <button className="start-button" onClick={onStart}>START</button>
      <div style={{ marginTop: '20px' }}>
        <button onClick={handleSeedData} disabled={isSeeding} style={{ padding: '10px', cursor: isSeeding ? 'not-allowed' : 'pointer' }}>
          {isSeeding ? 'Seeding...' : 'Seed Mock Data'}
        </button>
        {seedMessage && <p style={{ color: 'white', marginTop: '10px' }}>{seedMessage}</p>}
      </div>
    </div>
  );
}