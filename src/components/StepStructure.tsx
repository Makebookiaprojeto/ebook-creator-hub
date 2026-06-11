import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';

export function StepStructure() {
  return (
    <div className="flex flex-col space-y-6">
      {[1, 2, 3, 4, 5].map(step => (
        <motion.div 
          key={step} 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: step * 0.1 }}
          className="shadow-glow rounded-xl"
        >
          <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full gradient-primary text-primary-foreground font-bold text-sm">
                {step}
              </div>
              <h2 className="font-display text-xl font-bold tracking-tight">Passo {step}</h2>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Conteúdo detalhado para o passo {step} do seu processo. Esta estrutura permite uma visualização clara do progresso e mantém a consistência visual com o novo design system.
            </p>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
