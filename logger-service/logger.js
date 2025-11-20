const { Kafka } = require('kafkajs');
const express = require('express');
const cors = require('cors');

const app = express();
const port = 3001; // This service will run on port 3001
const kafkaBroker = process.env.KAFKA_BROKER_URL || 'kafka:9092';
const topic = 'product-events';

// --- In-Memory Event Store ---
// This will hold events received from Kafka
let receivedEvents = [];

// --- Express API Setup ---
app.use(cors());
app.use(express.json());

// This is the new endpoint our frontend will poll
// It's mapped to /api-logger/api/events by Nginx
app.get('/api/events', (req, res) => {
  // Send the current list of events
  res.json(receivedEvents);
  
  // IMPORTANT: Clear the list after sending
  // This ensures the frontend only gets *new* events next time
  receivedEvents = [];
});

app.listen(port, () => {
  console.log(`[LOGGER-API] Event API listening at http://localhost:${port}`);
});

// --- Kafka Consumer Setup ---
const kafka = new Kafka({
  clientId: 'logger-consumer',
  brokers: [kafkaBroker]
});

const consumer = kafka.consumer({ groupId: 'logger-group' });

const runConsumer = async () => {
  try {
    await consumer.connect();
    await consumer.subscribe({ topic: topic, fromBeginning: true });
    console.log(`[KAFKA-CONSUMER] Subscribed to topic: ${topic}`);
    console.log('[KAFKA-CONSUMER] Waiting for messages...');

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const event = JSON.parse(message.value.toString());
          console.log(`[KAFKA-CONSUMER] Received event:`);
          console.log(event);

          // Add the event to our in-memory list
          receivedEvents.push(event);

        } catch (e) {
          console.error('[KAFKA-CONSUMER] Error parsing message', e);
        }
      },
    });
  } catch (err) {
    console.error('[KAFKA-CONSUMER] Failed to connect or run consumer', err);
    // Keep retrying on failure
    setTimeout(runConsumer, 5000);
  }
};

// Start the Kafka consumer
runConsumer();