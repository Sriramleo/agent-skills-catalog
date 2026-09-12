import React from 'react';
import {
  Bot,
  CheckCircle2,
  Layers,
  Layout,
  Server,
  Shield,
  Cpu,
  Database,
  Zap,
  BookOpen,
  Folder,
  FolderGit2,
  Sparkles,
  Terminal,
  MousePointerClick,
  FileCode,
  Tag,
  Boxes
} from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = 'w-4 h-4' }) => {
  switch (name?.toLowerCase()) {
    case 'bot':
      return <Bot className={className} />;
    case 'checkcircle2':
    case 'check-circle':
      return <CheckCircle2 className={className} />;
    case 'layers':
      return <Layers className={className} />;
    case 'layout':
      return <Layout className={className} />;
    case 'server':
      return <Server className={className} />;
    case 'shield':
      return <Shield className={className} />;
    case 'cpu':
      return <Cpu className={className} />;
    case 'database':
      return <Database className={className} />;
    case 'zap':
      return <Zap className={className} />;
    case 'bookopen':
    case 'book-open':
      return <BookOpen className={className} />;
    case 'foldergit2':
      return <FolderGit2 className={className} />;
    case 'sparkles':
      return <Sparkles className={className} />;
    case 'terminal':
      return <Terminal className={className} />;
    case 'mousepointerclick':
      return <MousePointerClick className={className} />;
    case 'filecode':
      return <FileCode className={className} />;
    case 'tag':
      return <Tag className={className} />;
    default:
      return <Boxes className={className} />;
  }
};
