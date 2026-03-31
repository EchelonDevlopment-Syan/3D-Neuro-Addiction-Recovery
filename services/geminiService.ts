/**
 * Generates an initial brain visualization based on current neurochemical state.
 */
export const generateBrainStateImage = async (
  dopamine: number,
  serotonin: number,
  substance: string
): Promise<string> => {
  const response = await fetch("/api/generate-brain", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dopamine, serotonin, substance }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to generate brain image");
  }

  const data = await response.json();
  return data.imageData;
};

/**
 * Edits an existing brain image based on user text prompt.
 */
export const editBrainImage = async (
  base64Image: string,
  userPrompt: string
): Promise<string> => {
  const response = await fetch("/api/edit-brain", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ base64Image, userPrompt }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to edit brain image");
  }

  const data = await response.json();
  return data.imageData;
};
