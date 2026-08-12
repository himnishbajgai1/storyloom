# Export verification

A live export was completed from the Storyloom editor after uploading `pasted_file_FGEGym_image.png`, entering the goal “Book more qualified calls for my coaching offer,” and generating AI copy.

The downloaded PNG is 1080×1920 and opens successfully. The generated card’s lower glass panel stays inside the frame, the headline and caption are readable, and the exported image contains no watermark added by Storyloom’s renderer. A faint `STORYLOOM` mark remains near the top because it is already present in the uploaded source image itself; it is not drawn by the export renderer. The renderer-level export plan explicitly returns `drawWatermark: false`.
