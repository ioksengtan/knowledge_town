import type { ResourcePool } from '../game/types';
import { RESOURCE_ICON } from '../game/logic';

export default function ResourceBar({ resources }: { resources: ResourcePool }) {
  return (
    <span className="resource-bar">
      <span className="resource-pill">{RESOURCE_ICON.wood} {resources.wood}</span>
      <span className="resource-pill">{RESOURCE_ICON.ore} {resources.ore}</span>
      <span className="resource-pill">{RESOURCE_ICON.food} {resources.food}</span>
    </span>
  );
}
