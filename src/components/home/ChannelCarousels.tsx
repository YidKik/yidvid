
  useEffect(() => {
    async function fetchChannels() {
      try {
        const { data, error } = await supabase
          .from("youtube_channels")
          .select("id, channel_id, title, thumbnail_url")
          .is("deleted_at", null)
          .limit(200);

        if (error) {
          console.error("Error fetching channels:", error);
          throw error;
        }

        const formattedChannels = data.map((channel) => ({
          id: channel.id,
          channel_id: channel.channel_id,
          title: channel.title,
          thumbnail_url: channel.thumbnail_url
        }));

        setChannels(formattedChannels);
      } catch (err) {
        console.error("Error in channel fetch:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchChannels();
  }, []);
