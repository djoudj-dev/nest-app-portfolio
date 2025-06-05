export interface Project {
  id: string;
  title: string;
  description: string;
  image?: string;
  categoryId: string;
  deployUrl?: string;
  iconDeploy: string;
  repos: ProjectRepo[];
  technologies: string[];
  priority: number;
  category?: ProjectCategory;
}

export interface ProjectRepo {
  url: string;
  label: string;
  icon: string;
}

export interface ProjectCategory {
  id: string;
  label: string;
  icon: string;
}

export interface ProjectTechnology {
  id: string;
  label: string;
  icon: string;
}
