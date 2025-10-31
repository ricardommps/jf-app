import React, { useState, useCallback, useRef } from "react";
import {
  View,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  ScrollView,
  RefreshControl,
  Text,
  StyleSheet,
} from "react-native";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Heart, MessageCircle, Send, Bookmark } from "lucide-react-native";

const { width } = Dimensions.get("window");

interface Post {
  id: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    isVerified: boolean;
  };
  content: string;
  images: string[];
  likes: number;
  comments: number;
  createdAt: string;
  liked: boolean;
  saved: boolean;
}

interface FeedResponse {
  posts: Post[];
  nextCursor: string | null;
  totalCount: number;
  hasMore: boolean;
}

// Mock API - Substitua com sua API real
const mockPosts: Post[] = Array.from({ length: 50 }, (_, i) => ({
  id: `post-${i}`,
  author: {
    id: `user-${i % 5}`,
    name: [
      "quierocafeoficial",
      "soubiorun",
      "fotooficial",
      "naturealove",
      "techvibe",
    ][i % 5],
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
    isVerified: i % 3 === 0,
  },
  content: [
    "Café quentinho pra viver bem a manhã. ☕❤️",
    "Vai de carro para a SouBio Run? O estacionamento é no CentroSul (pago) Local privativo",
    "Momento perfeito com a natureza 🌿✨",
    "Inovação e tecnologia para melhorar sua vida",
    "Aproveitem o fim de semana! 🎉",
  ][i % 5],
  images:
    i % 4 === 0
      ? [
          `https://picsum.photos/500/600?random=${i}`,
          `https://picsum.photos/500/600?random=${i + 1}`,
          `https://picsum.photos/500/600?random=${i + 2}`,
        ]
      : [`https://picsum.photos/500/600?random=${i}`],
  likes: Math.floor(Math.random() * 5000) + 100,
  comments: Math.floor(Math.random() * 200) + 10,
  createdAt: new Date(
    Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
  ).toISOString(),
  liked: false,
  saved: false,
}));

// Simular API com cursor-based pagination
const fetchPosts = async (cursor?: string): Promise<FeedResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const take = 10;
  const skip = cursor
    ? JSON.parse(Buffer.from(cursor, "base64").toString()).skip
    : 0;

  const start = skip;
  const end = start + take;
  const posts = mockPosts.slice(start, end);

  const nextSkip = end;
  const hasMore = end < mockPosts.length;
  const nextCursor = hasMore
    ? Buffer.from(JSON.stringify({ skip: nextSkip })).toString("base64")
    : null;

  return {
    posts: posts.map((post, idx) => ({
      ...post,
      id: `${post.id}-${skip + idx}`,
    })),
    nextCursor,
    totalCount: mockPosts.length,
    hasMore,
  };
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1a",
  },
  headerText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "900",
  },
  headerTextRed: {
    color: "#ff0000",
  },
  postContainer: {
    backgroundColor: "#000",
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1a",
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
  },
  postHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  authorInfo: {
    gap: 4,
  },
  authorName: {
    color: "#fff",
    fontWeight: "600",
  },
  verifiedBadge: {
    backgroundColor: "#0066ff",
    borderRadius: 12,
    width: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
  },
  verifiedText: {
    color: "#fff",
    fontSize: 10,
  },
  timeText: {
    color: "#999",
    fontSize: 11,
  },
  moreButton: {
    fontSize: 20,
  },
  carouselContainer: {
    backgroundColor: "#000",
    position: "relative",
  },
  carouselImage: {
    width,
    height: 500,
    backgroundColor: "#000",
  },
  dotsContainer: {
    position: "absolute",
    bottom: 12,
    left: "50%",
    transform: [{ translateX: -40 }],
    flexDirection: "row",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: "#fff",
  },
  dotInactive: {
    backgroundColor: "#666",
  },
  imageBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  imageBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionsLeft: {
    flexDirection: "row",
    gap: 16,
  },
  likes: {
    paddingHorizontal: 12,
    paddingVertical: 0,
  },
  likesText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
  },
  caption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  captionText: {
    color: "#fff",
  },
  authorNameBold: {
    fontWeight: "600",
  },
  captionContent: {
    color: "#d0d0d0",
  },
  commentsButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  commentsText: {
    color: "#999",
    fontSize: 12,
  },
  commentInput: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "#1a1a1a",
  },
  inputField: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  inputPlaceholder: {
    color: "#999",
    fontSize: 12,
  },
  loader: {
    paddingVertical: 16,
    alignItems: "center",
  },
  authorNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
});

interface ImageProps {
  image: string;
}

const SimpleImage: React.FC<ImageProps> = ({ image }) => {
  return (
    <View style={styles.carouselContainer}>
      <Image
        source={{ uri: image }}
        style={styles.carouselImage}
        resizeMode="cover"
      />
    </View>
  );
};

interface ImageCarouselProps {
  images: string[];
  postId: string;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, postId }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    setCurrentIndex(index);
  };

  return (
    <View style={styles.carouselContainer}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        scrollEventThrottle={16}
        onScroll={handleScroll}
        showsHorizontalScrollIndicator={false}
        scrollEnabled
      >
        {images.map((image, idx) => (
          <Image
            key={`${postId}-img-${idx}`}
            source={{ uri: image }}
            style={styles.carouselImage}
            resizeMode="cover"
          />
        ))}
      </ScrollView>

      <View style={styles.dotsContainer}>
        {images.map((_, idx) => (
          <View
            key={`dot-${idx}`}
            style={[
              styles.dot,
              idx === currentIndex ? styles.dotActive : styles.dotInactive,
            ]}
          />
        ))}
      </View>

      <View style={styles.imageBadge}>
        <Text style={styles.imageBadgeText}>{images.length}</Text>
      </View>
    </View>
  );
};

interface PostItemProps {
  post: Post;
}

const PostItem: React.FC<PostItemProps> = ({ post }) => {
  const [liked, setLiked] = useState(post.liked);
  const [saved, setSaved] = useState(post.saved);
  const [likeCount, setLikeCount] = useState(post.likes);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
  };

  const formatTime = (date: string) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInHours = Math.floor(
      (now.getTime() - postDate.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "agora";
    if (diffInHours < 24) return `${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d`;
  };

  return (
    <View style={styles.postContainer}>
      <View style={styles.postHeader}>
        <View style={styles.postHeaderLeft}>
          <Image source={{ uri: post.author.avatar }} style={styles.avatar} />
          <View style={styles.authorInfo}>
            <View style={styles.authorNameRow}>
              <Text style={styles.authorName}>{post.author.name}</Text>
              {post.author.isVerified && (
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>✓</Text>
                </View>
              )}
            </View>
            <Text style={styles.timeText}>{formatTime(post.createdAt)}</Text>
          </View>
        </View>
        <TouchableOpacity>
          <Text style={styles.moreButton}>⋯</Text>
        </TouchableOpacity>
      </View>

      {post.images.length === 1 ? (
        <SimpleImage image={post.images[0]} />
      ) : (
        <ImageCarousel images={post.images} postId={post.id} />
      )}

      <View style={styles.actions}>
        <View style={styles.actionsLeft}>
          <TouchableOpacity onPress={handleLike}>
            <Heart
              size={24}
              color={liked ? "#ff0000" : "#fff"}
              fill={liked ? "#ff0000" : "none"}
            />
          </TouchableOpacity>
          <TouchableOpacity>
            <MessageCircle size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Send size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => setSaved(!saved)}>
          <Bookmark size={24} color="#fff" fill={saved ? "#fff" : "none"} />
        </TouchableOpacity>
      </View>

      <View style={styles.likes}>
        <Text style={styles.likesText}>
          {likeCount.toLocaleString()} curtidas
        </Text>
      </View>

      <View style={styles.caption}>
        <Text style={styles.captionText}>
          <Text style={styles.authorNameBold}>{post.author.name}</Text>
          <Text style={styles.captionContent}> {post.content}</Text>
        </Text>
      </View>

      <TouchableOpacity style={styles.commentsButton}>
        <Text style={styles.commentsText}>Ver {post.comments} comentários</Text>
      </TouchableOpacity>

      <View style={styles.commentInput}>
        <Image
          source={{
            uri: "https://api.dicebear.com/7.x/avataaars/svg?seed=current",
          }}
          style={styles.avatar}
        />
        <View style={styles.inputField}>
          <Text style={styles.inputPlaceholder}>Adicionar comentário...</Text>
        </View>
      </View>
    </View>
  );
};

interface LoaderProps {
  visible: boolean;
}

const Loader: React.FC<LoaderProps> = ({ visible }) => {
  if (!visible) return null;
  return (
    <View style={styles.loader}>
      <ActivityIndicator size="large" color="#fff" />
    </View>
  );
};

export default function InstagramFeedClone() {
  const [refreshing, setRefreshing] = useState(false);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["feed"],
    queryFn: ({ pageParam }: { pageParam?: string }) => fetchPosts(pageParam),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
  });

  const posts = data?.pages.flatMap((page) => page.posts) ?? [];

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>
          Quiero<Text style={styles.headerTextRed}>Café</Text>
        </Text>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PostItem post={item} />}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          <Loader visible={isFetchingNextPage || isLoading} />
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#fff"
            colors={["#fff"]}
          />
        }
      />
    </View>
  );
}
// const fetchPosts = async (cursor?: string): Promise<FeedResponse> => {
//   const params = new URLSearchParams({
//     take: '10',
//     isActive: 'true',
//     sortBy: 'Name',
//     sortDirection: 'Asc',
//   });

//   if (cursor) {
//     params.append('cursor', cursor);
//   }

//   const response = await fetch(
//     `https://seu-api.com/api/v1/products/123/coverages?${params}`
//   );
//   return response.json();
// };
