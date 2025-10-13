import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AnalysisResult {
  approved: boolean;
  textAnalysis: {
    appropriate: boolean;
    noInappropriateContent: boolean;
    score: number;
  };
  thumbnailAnalysis?: {
    safe: boolean;
    score: number;
    detected: string[];
  };
  videoAnalysis?: {
    safe: boolean;
    score: number;
    frames_analyzed: number;
    issues_detected: string[];
  };
  finalScore: number;
  reasoning: string;
  category: string;
}

const createSupabaseClient = () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase configuration');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
};

const analyzeThumbnail = async (thumbnailUrl: string): Promise<any> => {
  const sightengineUser = Deno.env.get('SIGHTENGINE_API_USER');
  const sightengineSecret = Deno.env.get('SIGHTENGINE_API_SECRET');
  
  if (!sightengineUser || !sightengineSecret) {
    console.log('Sightengine API credentials not configured, skipping thumbnail analysis');
    return { safe: true, score: 0.9, detected: [] };
  }

  try {
    const response = await fetch('https://api.sightengine.com/1.0/check.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'url': thumbnailUrl,
        'models': 'nudity-2.0,wad,face-attributes,celebrities',
        'api_user': sightengineUser,
        'api_secret': sightengineSecret,
      }),
    });

    if (!response.ok) {
      console.error('Sightengine API error:', response.status);
      return { safe: true, score: 0.5, detected: ['api_error'] };
    }

    const result = await response.json();
    console.log('Thumbnail analysis result:', result);

    // Check for inappropriate content
    const issues = [];
    const detailedReasons = [];
    let score = 1.0;

    // Check nudity
    if (result.nudity && result.nudity.sexual_activity > 0.3) {
      issues.push('sexual_content');
      detailedReasons.push(`Sexual content detected in thumbnail (confidence: ${(result.nudity.sexual_activity * 100).toFixed(0)}%)`);
      score = Math.min(score, 0.2);
    }

    // Check faces and gender detection
    if (result.faces && result.faces.length > 0) {
      for (const face of result.faces) {
        if (face.attributes && face.attributes.gender) {
          const confidence = face.attributes.gender.female;
          if (confidence > 0.7) {
            issues.push('female_detected');
            detailedReasons.push(`Female/woman detected in thumbnail (confidence: ${(confidence * 100).toFixed(0)}%). All videos with women/girls are flagged for review.`);
            score = Math.min(score, 0.1);
          }
        }
      }
    }

    // Check weapons and drugs
    if (result.weapon && result.weapon > 0.5) {
      issues.push('weapon_detected');
      detailedReasons.push(`Weapon detected in thumbnail (confidence: ${(result.weapon * 100).toFixed(0)}%)`);
      score = Math.min(score, 0.3);
    }

    if (result.drugs && result.drugs > 0.5) {
      issues.push('drugs_detected');
      detailedReasons.push(`Drugs detected in thumbnail (confidence: ${(result.drugs * 100).toFixed(0)}%)`);
      score = Math.min(score, 0.3);
    }

    return {
      safe: score > 0.5,
      score: score,
      detected: issues,
      rejection_reason: detailedReasons.join(' '),
      faces: result.faces || []
    };

  } catch (error) {
    console.error('Error analyzing thumbnail:', error);
    return { safe: true, score: 0.5, detected: ['analysis_error'] };
  }
};

const analyzeVideoContent = async (videoId: string): Promise<any> => {
  const sightengineUser = Deno.env.get('SIGHTENGINE_API_USER');
  const sightengineSecret = Deno.env.get('SIGHTENGINE_API_SECRET');
  
  if (!sightengineUser || !sightengineSecret) {
    console.log('Sightengine API credentials not configured, skipping video analysis');
    return { safe: true, score: 0.9, frames_analyzed: 0, issues_detected: [] };
  }

  try {
    // Use YouTube video frames for analysis
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    
    const response = await fetch('https://api.sightengine.com/1.0/video/check-sync.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'url': videoUrl,
        'models': 'nudity-2.0,wad,face-attributes',
        'api_user': sightengineUser,
        'api_secret': sightengineSecret,
      }),
    });

    if (!response.ok) {
      console.error('Sightengine video API error:', response.status);
      return { safe: true, score: 0.5, frames_analyzed: 0, issues_detected: ['api_error'] };
    }

    const result = await response.json();
    console.log('Video analysis result:', result);

    const issues = [];
    const problematicFrames = [];
    let score = 1.0;
    let framesAnalyzed = 0;

    if (result.data && result.data.frames) {
      framesAnalyzed = result.data.frames.length;
      
      for (const frame of result.data.frames) {
        const frameIssues = [];
        
        // Check nudity in each frame
        if (frame.nudity && frame.nudity.sexual_activity > 0.3) {
          issues.push('sexual_content');
          frameIssues.push(`Sexual content detected (confidence: ${(frame.nudity.sexual_activity * 100).toFixed(0)}%)`);
          score = Math.min(score, 0.1);
        }

        // Check faces for gender detection
        if (frame.faces && frame.faces.length > 0) {
          for (const face of frame.faces) {
            if (face.attributes && face.attributes.gender) {
              const confidence = face.attributes.gender.female;
              if (confidence > 0.7) {
                issues.push('female_detected');
                frameIssues.push(`Female/woman detected (confidence: ${(confidence * 100).toFixed(0)}%)`);
                score = Math.min(score, 0.1);
              }
            }
          }
        }

        // Check weapons and drugs
        if (frame.weapon && frame.weapon > 0.5) {
          issues.push('weapon_detected');
          frameIssues.push(`Weapon detected (confidence: ${(frame.weapon * 100).toFixed(0)}%)`);
          score = Math.min(score, 0.3);
        }

        // If this frame has issues, store it
        if (frameIssues.length > 0) {
          problematicFrames.push({
            time: frame.time || 0,
            issues: frameIssues,
            // Generate frame URL from video ID and timestamp
            frameUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
            faces: frame.faces?.length || 0
          });
        }
      }
    }

    return {
      safe: score > 0.5,
      score: score,
      frames_analyzed: framesAnalyzed,
      issues_detected: [...new Set(issues)],
      problematic_frames: problematicFrames
    };

  } catch (error) {
    console.error('Error analyzing video content:', error);
    return { safe: true, score: 0.5, frames_analyzed: 0, issues_detected: ['analysis_error'] };
  }
};

const determineCategory = (title: string, description: string, channelName: string): string => {
  const fullText = `${title || ''} ${description || ''} ${channelName || ''}`.toLowerCase();
  
  // Category keywords
  const musicKeywords = ['music', 'song', 'album', 'singer', 'artist', 'concert', 'performance', 'acoustic', 'cover', 'remix', 'lyrics', 'band', 'musical'];
  const torahKeywords = ['torah', 'parsha', 'shiur', 'rabbi', 'talmud', 'gemara', 'jewish', 'judaism', 'halacha', 'mitzvah', 'shabbat', 'kosher', 'prayer', 'synagogue', 'yeshiva', 'chassidus'];
  const inspirationKeywords = ['inspiration', 'motivational', 'inspire', 'wisdom', 'life lessons', 'personal growth', 'success', 'mindset', 'positive', 'encouragement', 'faith', 'spiritual'];
  const podcastKeywords = ['podcast', 'interview', 'discussion', 'talk show', 'conversation', 'episode', 'guest', 'host'];
  const educationKeywords = ['education', 'tutorial', 'lesson', 'learning', 'teach', 'course', 'lecture', 'study', 'guide', 'how to', 'explanation', 'academic'];
  const entertainmentKeywords = ['entertainment', 'comedy', 'funny', 'humor', 'sketch', 'vlog', 'challenge', 'reaction', 'gaming', 'movie', 'film', 'show'];
  
  // Count matches for each category
  const scores = {
    music: musicKeywords.filter(k => fullText.includes(k)).length,
    torah: torahKeywords.filter(k => fullText.includes(k)).length,
    inspiration: inspirationKeywords.filter(k => fullText.includes(k)).length,
    podcast: podcastKeywords.filter(k => fullText.includes(k)).length,
    education: educationKeywords.filter(k => fullText.includes(k)).length,
    entertainment: entertainmentKeywords.filter(k => fullText.includes(k)).length,
  };
  
  // Find category with highest score
  const maxScore = Math.max(...Object.values(scores));
  
  if (maxScore === 0) {
    return 'other';
  }
  
  const category = Object.entries(scores).find(([_, score]) => score === maxScore)?.[0] || 'other';
  return category;
};

const analyzeText = (title: string, description: string, channelName: string): any => {
  // Enhanced forbidden words list
  const forbiddenWords = [
    'inappropriate', 'obscene', 'offensive', 'explicit', 'adult', 'nsfw',
    'sexy', 'hot', 'dating', 'romance', 'intimate', 'sensual'
  ];
  
  const sensitiveTerms = [
    'women', 'woman', 'lady', 'ladies', 'female', 'girl', 'girls',
    'wife', 'wives', 'mother', 'mom', 'sister', 'daughter',
    'girlfriend', 'bride', 'beauty', 'beautiful'
  ];

  const inappropriateTerms = [
    'violence', 'fight', 'war', 'kill', 'death', 'murder',
    'drugs', 'alcohol', 'smoking', 'gambling', 'betting'
  ];
  
  // Check all text content
  const allText = `${title || ''} ${description || ''} ${channelName || ''}`.toLowerCase();
  
  const hasForbiddenWords = forbiddenWords.some(word => allText.includes(word));
  const hasSensitiveTerms = sensitiveTerms.some(term => allText.includes(term));
  const hasInappropriateTerms = inappropriateTerms.some(term => allText.includes(term));
  
  let score = 1.0;
  const issues = [];
  
  if (hasForbiddenWords) {
    score = Math.min(score, 0.2);
    issues.push('forbidden_words');
  }
  
  if (hasSensitiveTerms) {
    score = Math.min(score, 0.1);
    issues.push('female_references');
  }
  
  if (hasInappropriateTerms) {
    score = Math.min(score, 0.3);
    issues.push('inappropriate_content');
  }

  return {
    appropriate: !hasForbiddenWords && !hasInappropriateTerms,
    noInappropriateContent: !hasSensitiveTerms,
    score: score,
    issues: issues
  };
};

const logAnalysisResult = async (supabase: any, videoId: string, stage: string, result: any, processingTime: number, error?: string) => {
  try {
    await supabase
      .from('content_analysis_logs')
      .insert({
        video_id: videoId,
        analysis_stage: stage,
        stage_result: result,
        processing_time_ms: processingTime,
        error_message: error
      });
  } catch (logError) {
    console.error('Error logging analysis result:', logError);
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, description, videoId, thumbnailUrl, channelName } = await req.json();
    console.log('Analyzing content for video:', { videoId, title });

    const startTime = Date.now();
    const supabase = createSupabaseClient();

    // Determine category from text
    const category = determineCategory(title, description, channelName);
    console.log('Determined category:', category);

    // Stage 1: Text Analysis
    const textStartTime = Date.now();
    const textAnalysis = analyzeText(title, description, channelName);
    const textProcessingTime = Date.now() - textStartTime;
    
    await logAnalysisResult(supabase, videoId, 'text_analysis', textAnalysis, textProcessingTime);
    
    // Stage 2: Thumbnail Analysis (if URL provided)
    let thumbnailAnalysis = { safe: true, score: 0.9, detected: [] };
    if (thumbnailUrl) {
      const thumbnailStartTime = Date.now();
      thumbnailAnalysis = await analyzeThumbnail(thumbnailUrl);
      const thumbnailProcessingTime = Date.now() - thumbnailStartTime;
      
      await logAnalysisResult(supabase, videoId, 'thumbnail_analysis', thumbnailAnalysis, thumbnailProcessingTime);
    }

    // Stage 3: Video Content Analysis (if video ID provided)
    let videoAnalysis = { safe: true, score: 0.9, frames_analyzed: 0, issues_detected: [] };
    if (videoId && videoId !== 'unknown') {
      const videoStartTime = Date.now();
      videoAnalysis = await analyzeVideoContent(videoId);
      const videoProcessingTime = Date.now() - videoStartTime;
      
      await logAnalysisResult(supabase, videoId, 'video_analysis', videoAnalysis, videoProcessingTime);
    }

    // Calculate final score (weighted average)
    const textWeight = 0.3;
    const thumbnailWeight = 0.3;
    const videoWeight = 0.4;
    
    const finalScore = (
      textAnalysis.score * textWeight +
      thumbnailAnalysis.score * thumbnailWeight +
      videoAnalysis.score * videoWeight
    );

    // Determine if content is approved
    const isApproved = finalScore > 0.6 && 
                     textAnalysis.appropriate && 
                     textAnalysis.noInappropriateContent &&
                     thumbnailAnalysis.safe && 
                     videoAnalysis.safe;

    // Generate detailed reasoning
    const issues = [
      ...textAnalysis.issues || [],
      ...thumbnailAnalysis.detected || [],
      ...videoAnalysis.issues_detected || []
    ];

    const reasoningParts = [];
    
    if (!isApproved) {
      if (thumbnailAnalysis.rejection_reason) {
        reasoningParts.push(thumbnailAnalysis.rejection_reason);
      }
      if (videoAnalysis.problematic_frames && videoAnalysis.problematic_frames.length > 0) {
        reasoningParts.push(`Video contains ${videoAnalysis.problematic_frames.length} problematic frame(s) with detected issues.`);
      }
      if (textAnalysis.issues && textAnalysis.issues.length > 0) {
        reasoningParts.push(`Text contains: ${textAnalysis.issues.join(', ')}`);
      }
    }

    let reasoning = isApproved ? 
      'Content passed all kosher filtering checks.' :
      reasoningParts.join(' ');

    const response: AnalysisResult = {
      approved: isApproved,
      textAnalysis: {
        appropriate: textAnalysis.appropriate,
        noInappropriateContent: textAnalysis.noInappropriateContent,
        score: textAnalysis.score
      },
      thumbnailAnalysis: thumbnailAnalysis,
      videoAnalysis: videoAnalysis,
      finalScore: finalScore,
      reasoning: reasoning,
      category: category
    };

    console.log('Final analysis result:', response);

    const totalProcessingTime = Date.now() - startTime;
    await logAnalysisResult(supabase, videoId, 'final_analysis', response, totalProcessingTime);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error in analyze-video-content:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      approved: false,
      finalScore: 0.0,
      reasoning: 'Analysis failed due to system error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});