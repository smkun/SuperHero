const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const dotenv = require("dotenv");

dotenv.config();

// Function to calculate power score based on hero power stats
function calculatePowerScore(powerstats) {
    return Object.values(powerstats).reduce((sum, stat) => sum + parseInt(stat, 10), 0);
}

// Function to initiate image creation for a fight and return the proxy_url
async function generateFightImage(hero1, hero2) {
    const prompt = `Marvel comics, heroes fighting, ${hero1.name} VS ${hero2.name} --ar 16:9`;
    try {
        const response = await fetch("https://api.userapi.ai/midjourney/v2/imagine", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': process.env.MIDJOURNEY_API_KEY,
            },
            body: JSON.stringify({
                prompt: prompt,
                webhook_url: "https://example.com/imagine/webhook-url",
                webhook_type: "result",
                account_hash: "09078a70-e838-4339-a34d-c7ac36d4e14d",
                is_disable_prefilter: false,
            }),
        });

        const data = await response.json();
        const taskHash = data.hash;

        // Directly return the imageUrl from the status check
        return await checkAndRetrieveImageUrl(taskHash);
    } catch (error) {
        console.error("Error generating the fight image:", error);
        throw error;
    }
}

async function checkAndRetrieveImageUrl(taskHash) {
    let imageUrl = null;
    let attempts = 0; // Set a maximum number of attempts to avoid infinite loops
    const maxAttempts = 50; // You can adjust this based on expected API response times

    while (!imageUrl && attempts < maxAttempts) {
        const statusData = await getImageStatus(taskHash);
        console.log(`Attempt ${attempts + 1}:`, statusData); // Log the status data to see what's happening

        // Check if statusData itself is the URL
        if (statusData && isValidHttpUrl(statusData)) {
            imageUrl = statusData;  // Assume statusData is the URL if it's a valid URL
            console.log("Successfully retrieved image URL:", imageUrl); // Log successful retrieval
            break; // Exit loop if URL is obtained
        } else if (statusData && statusData.proxy_url) {
            imageUrl = statusData.proxy_url; // Normal handling if proxy_url is present
            console.log("Successfully retrieved image URL:", imageUrl); // Log successful retrieval
            break; // Exit loop if URL is obtained
        }

        attempts++;
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait before retrying
    }

    if (!imageUrl) {
        console.error("Failed to retrieve the image URL after", maxAttempts, "attempts.");
        throw new Error("Failed to retrieve the image URL.");
    }

    return imageUrl;
}

// Helper function to check if a string is a valid URL
function isValidHttpUrl(string) {
    let url;
    
    try {
        url = new URL(string);
    } catch (_) {
        return false;  
    }

    return url.protocol === "http:" || url.protocol === "https:";
}



async function getImageStatus(taskHash) {
    try {
        const response = await fetch(`https://api.userapi.ai/midjourney/v2/status?hash=${taskHash}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'api-key': process.env.MIDJOURNEY_API_KEY, 
            },
        });

        const statusData = await response.json();
        // console.log("Task status:", statusData.status, "Image data:", statusData.result);
        // Check if the task is complete and the result is available
        if (statusData.status === "done") {
            if (statusData.result && statusData.result.proxy_url) {
                return statusData.result.proxy_url;  // Return the URL
                console.log(statusData.result.proxy_url);
            } else {
                // No proxy_url found, even though the task is done, handle this case
                console.error("Image generation complete, but no URL provided.");
                throw new Error("Image generation complete, but no URL provided.");
            }
        } else if (statusData.status === "error") {
            // The task reported an error
            throw new Error("Error generating the image.");
        } else {
            // Task is still in progress or other status; should return null and be handled by the caller
            return null;
        }
    } catch (error) {
        console.error("Error fetching image status:", error);
        throw error; // Re-throw to ensure the error is handled further up the call stack
    }
}


// Main function to handle the hero fight logic and image generation
async function handleFight(hero1, hero2) {
    try {
        const hero1Score = calculatePowerScore(hero1.powerstats);
        const hero2Score = calculatePowerScore(hero2.powerstats);
        const winner = hero1Score > hero2Score ? hero1 : hero2;

        const imageUrl = await generateFightImage(hero1, hero2);  // Directly store the returned imageUrl
        console.log("LINE97 Winner:", winner.name, "Image URL:", imageUrl);
        return { hero1, hero2, winner, imageUrl };
    } catch (error) {
        console.error("Error during hero fight:", error);
        throw error;
    }
}


module.exports = { handleFight };
