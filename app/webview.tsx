import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import { createStyles, colors, spacing, borderRadius, fontSize } from '@/utils/styles';

const styles = createStyles({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: spacing.lg,
  },
  errorText: {
    fontSize: fontSize.base,
    color: colors.error,
    textAlign: 'center' as const,
    marginBottom: spacing.md,
  },
  retryButton: {
    backgroundColor: colors.primary[600],
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: '600' as const,
  },
});

const courseContentHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Course Content</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9fafb;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
        }
        .section {
            background: white;
            padding: 25px;
            border-radius: 10px;
            margin-bottom: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .section h2 {
            color: #2563eb;
            margin-top: 0;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 10px;
        }
        .lesson-item {
            background: #f8fafc;
            padding: 15px;
            border-left: 4px solid #3b82f6;
            margin: 10px 0;
            border-radius: 5px;
        }
        .lesson-item h3 {
            margin: 0 0 5px 0;
            color: #1f2937;
        }
        .lesson-item p {
            margin: 0;
            color: #6b7280;
            font-size: 0.9em;
        }
        .progress-bar {
            background: #e5e7eb;
            height: 20px;
            border-radius: 10px;
            overflow: hidden;
            margin: 20px 0;
        }
        .progress-fill {
            background: linear-gradient(90deg, #10b981, #059669);
            height: 100%;
            width: 35%;
            transition: width 0.3s ease;
        }
        .quiz-section {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
        }
        .quiz-question {
            font-weight: bold;
            margin-bottom: 10px;
        }
        .quiz-option {
            background: white;
            padding: 10px;
            margin: 5px 0;
            border-radius: 5px;
            cursor: pointer;
            transition: background 0.2s;
        }
        .quiz-option:hover {
            background: #f3f4f6;
        }
        .resources {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin: 20px 0;
        }
        .resource-card {
            background: #eff6ff;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            border: 1px solid #bfdbfe;
        }
        .resource-card h4 {
            margin: 0 0 10px 0;
            color: #1e40af;
        }
        .btn {
            background: #3b82f6;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            margin: 5px;
        }
        .btn:hover {
            background: #2563eb;
        }
        .btn-success {
            background: #10b981;
        }
        .btn-success:hover {
            background: #059669;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 Advanced React Native Development</h1>
        <p>Master mobile app development with React Native and Expo</p>
    </div>

    <div class="section">
        <h2>📚 Course Overview</h2>
        <p>Welcome to this comprehensive React Native course! You'll learn everything from basic components to advanced patterns, performance optimization, and production deployment.</p>
        
        <div class="progress-bar">
            <div class="progress-fill"></div>
        </div>
        <p><strong>Your Progress: 35% Complete</strong></p>
    </div>

    <div class="section">
        <h2>📖 Course Modules</h2>
        
        <div class="lesson-item">
            <h3>Module 1: React Native Fundamentals</h3>
            <p>Learn the basics of React Native, components, and navigation. ✅ Completed</p>
        </div>
        
        <div class="lesson-item">
            <h3>Module 2: State Management</h3>
            <p>Master Context API, Redux, and modern state management solutions. 🔄 In Progress</p>
        </div>
        
        <div class="lesson-item">
            <h3>Module 3: Native Features</h3>
            <p>Camera, GPS, notifications, and device APIs. 📅 Upcoming</p>
        </div>
        
        <div class="lesson-item">
            <h3>Module 4: Performance Optimization</h3>
            <p>Optimize your apps for better performance and user experience. 📅 Upcoming</p>
        </div>
        
        <div class="lesson-item">
            <h3>Module 5: Deployment & Publishing</h3>
            <p>Learn how to publish your apps to App Store and Google Play. 📅 Upcoming</p>
        </div>
    </div>

    <div class="section">
        <h2>🎯 Quick Quiz</h2>
        <div class="quiz-section">
            <div class="quiz-question">What is the main advantage of using Expo in React Native development?</div>
            <div class="quiz-option" onclick="alert('Not quite! Try again.')">A) Faster build times</div>
            <div class="quiz-option" onclick="alert('Correct! Expo simplifies setup and provides many built-in features.')">B) Simplified setup and managed workflow</div>
            <div class="quiz-option" onclick="alert('Not quite! Try again.')">C) Better performance</div>
            <div class="quiz-option" onclick="alert('Not quite! Try again.')">D) Smaller app size</div>
        </div>
    </div>

    <div class="section">
        <h2>📋 Additional Resources</h2>
        <div class="resources">
            <div class="resource-card">
                <h4>📖 Documentation</h4>
                <p>Official React Native docs and guides</p>
                <button class="btn" onclick="alert('Opening documentation...')">View Docs</button>
            </div>
            
            <div class="resource-card">
                <h4>💻 Code Examples</h4>
                <p>Sample projects and code snippets</p>
                <button class="btn" onclick="alert('Loading examples...')">View Code</button>
            </div>
            
            <div class="resource-card">
                <h4>🎥 Video Tutorials</h4>
                <p>Supplementary video content</p>
                <button class="btn" onclick="alert('Loading videos...')">Watch Videos</button>
            </div>
            
            <div class="resource-card">
                <h4>💬 Community</h4>
                <p>Join our developer community</p>
                <button class="btn btn-success" onclick="alert('Welcome to the community!')">Join Now</button>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>🏆 Next Steps</h2>
        <p>Great progress! Continue with Module 2 to deepen your understanding of state management in React Native applications.</p>
        <button class="btn btn-success" onclick="alert('Continuing to next module...')">Continue Learning →</button>
    </div>

    <script>
        // Add some interactivity
        document.addEventListener('DOMContentLoaded', function() {
            // Simulate progress updates
            setTimeout(() => {
                const progressBar = document.querySelector('.progress-fill');
                progressBar.style.width = '40%';
            }, 2000);
        });
    </script>
</body>
</html>
`;

export default function WebViewScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const webViewRef = useRef<WebView>(null);
  const router = useRouter();

  const handleWebViewLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleWebViewError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const handleRetry = () => {
    setIsLoading(true);
    setHasError(false);
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };

  const injectedJavaScript = `
    // Inject communication bridge
    window.ReactNativeWebView = {
      postMessage: function(data) {
        window.ReactNativeWebView.postMessage(data);
      }
    };
    
    // Handle link clicks
    document.addEventListener('click', function(e) {
      if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A') {
        e.preventDefault();
        const message = {
          type: 'user_action',
          action: e.target.textContent,
          timestamp: new Date().toISOString()
        };
        window.ReactNativeWebView.postMessage(JSON.stringify(message));
      }
    });
    
    true; // Note: this is required, or you'll sometimes get silent failures
  `;

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('Message from WebView:', data);
      
      // Handle different types of messages
      if (data.type === 'user_action') {
        // You can handle user actions here
        // For example, track analytics, update state, etc.
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  if (hasError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Failed to load course content. Please check your internet connection.
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: courseContentHTML }}
        style={{ flex: 1 }}
        onLoad={handleWebViewLoad}
        onError={handleWebViewError}
        onMessage={handleMessage}
        injectedJavaScript={injectedJavaScript}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary[600]} />
            <Text style={{ marginTop: spacing.md, color: colors.gray[600] }}>
              Loading course content...
            </Text>
          </View>
        )}
      />
    </View>
  );
}
