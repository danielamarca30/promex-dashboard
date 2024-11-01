import { useState, useEffect } from 'preact/hooks';
import { signal } from '@preact/signals';
import axios from 'axios';

interface Video {
  id: string;
  title: string;
  description: string;
  usuarioId:string;
  active: boolean;
}

const videos = signal<Video[]>([]);
const currentVideoIndex = signal<number>(0);

export function Videos() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await axios.get('http://192.168.1.200/ext/videos');
      videos.value = response.data;
    } catch (error) {
      console.error('Error fetching videos:', error);
    }
  };

  const handleUpload = async (e: Event) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('video', file);
    formData.append('usuarioId', 'user123');

    try {
      await axios.post('http://192.168.1.200/ext/videos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('Video uploaded successfully!');
      setTitle('');
      setDescription('');
      setFile(null);
      fetchVideos();
    } catch (error) {
      console.error('Error uploading video:', error);
      alert('Error uploading video');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`http://192.168.1.200/ext/videos/${id}`);
      videos.value = videos.value.filter(video => video.id !== id);
    } catch (error) {
      console.error('Error deleting video:', error);
    }
  };

  const handleToggleActive = async (id: string, active: boolean) => {
    try {
      const video = videos.value.find(v => v.id === id);
      if (video) {
        await axios.put(`http://192.168.1.200/ext/videos/${id}`, {
          ...video,
          active: !active
        });
        fetchVideos();
      }
    } catch (error) {
      console.error('Error toggling video active state:', error);
    }
  };

  const handleNextVideo = () => {
    if (currentVideoIndex.value < videos.value.length - 1) {
      currentVideoIndex.value++;
    } else {
      currentVideoIndex.value = 0;
    }
  };

  const handlePreviousVideo = () => {
    if (currentVideoIndex.value > 0) {
      currentVideoIndex.value--;
    } else {
      currentVideoIndex.value = videos.value.length - 1;
    }
  };

  return (
    <div class="container mx-auto p-4">
      <h1 class="text-3xl font-bold mb-4">Video App</h1>

      <div class="mb-8">
        <h2 class="text-2xl font-bold mb-4">Upload Video</h2>
        <form onSubmit={handleUpload} class="space-y-4">
          <div>
            <label htmlFor="title" class="block mb-1">Title:</label>
            <input
              type="text"
              id="title"
              value={title}
              onInput={e => setTitle((e.target as HTMLInputElement).value)}
              required
              class="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label htmlFor="description" class="block mb-1">Description:</label>
            <textarea
              id="description"
              value={description}
              onInput={e => setDescription((e.target as HTMLTextAreaElement).value)}
              class="w-full px-3 py-2 border rounded"
            ></textarea>
          </div>
          <div>
            <label htmlFor="video" class="block mb-1">Video File:</label>
            <input
              type="file"
              id="video"
              accept="video/*"
              onChange={e => setFile((e.target as HTMLInputElement).files?.[0] || null)}
              required
              class="w-full"
            />
          </div>
          <button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Upload
          </button>
        </form>
      </div>

      <div class="mb-8">
        <h2 class="text-2xl font-bold mb-4">Video Player</h2>
        {videos.value.length > 0 && (
          <div>
            <video 
              src={`http://192.168.1.200/ext/stream/${videos.value[currentVideoIndex.value].id}`} 
              controls 
              class="w-full max-w-3xl mx-auto mb-4"
            ></video>
            <div class="flex justify-center space-x-4">
              <button onClick={handlePreviousVideo} class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
                Previous
              </button>
              <button onClick={handleNextVideo} class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <div class="mb-8">
        <h2 class="text-2xl font-bold mb-4">Video List</h2>
        <ul>
          {videos.value.map(video => (
            <li key={video.id} class="mb-2 flex items-center">
              <span class={`mr-2 ${video.active ? 'text-green-500' : 'text-red-500'}`}>
                {video.active ? '●' : '○'}
              </span>
              <span class="text-blue-500 hover:underline mr-2">
                {video.title}
              </span>
              <button 
                onClick={() => handleToggleActive(video.id, video.active)}
                class="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 mr-2"
              >
                Toggle Active
              </button>
              <button 
                onClick={() => handleDelete(video.id)}
                class="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}